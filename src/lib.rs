use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use wasm_bindgen::prelude::*;

const PROGRESS_THRESHOLD: f64 = 0.01; // report every 1% growth

// ============================================================
// PRNG — xorshift64, seeded once from Math.random()
// Keeps all random number generation inside WASM, avoiding
// the expensive WASM↔JS boundary crossing on every call.
// ============================================================

use std::cell::Cell;
thread_local! {
    static RNG_STATE: Cell<u64> = const { Cell::new(0) };
}

fn seed_rng(seed: Option<u64>) {
    let state = match seed {
        Some(s) => s | 1, // ensure non-zero
        None => {
            // Combine two Math.random() calls to get a full 64-bit seed
            let lo = (js_sys::Math::random() * (u32::MAX as f64)) as u64;
            let hi = (js_sys::Math::random() * (u32::MAX as f64)) as u64;
            (hi << 32) | lo | 1
        }
    };
    RNG_STATE.with(|s| s.set(state));
}

/// Returns a random u64 via xorshift64.
fn rand_u64() -> u64 {
    RNG_STATE.with(|s| {
        let mut x = s.get();
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        s.set(x);
        x
    })
}

/// Returns a random float in [0, 1).
#[inline]
fn rng_f64() -> f64 {
    (rand_u64() >> 11) as f64 / (1u64 << 53) as f64
}

/// Returns a random usize in [0, n).
#[inline]
fn rng_usize(n: usize) -> usize {
    ((rand_u64() as u128 * n as u128) >> 64) as usize
}

// ============================================================
// TYPES
// ============================================================

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SimParams {
    pub total_population: u32,
    pub avg_connections: f64,
    pub within_ratio: f64,
    pub max_years: u32,
    pub track_ancestors: bool,
    pub seed: Option<f64>, // optional deterministic seed; omit for random
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct YearlyState {
    pub influenced: u32,
    pub ancestors: Option<Vec<(u32, u32)>>, // (influencer, influenced)
}

impl YearlyState {
    fn new(influenced: u32, ancestors: Option<Vec<(u32, u32)>>) -> Self {
        YearlyState {
            influenced,
            ancestors,
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SimResult {
    pub years: u32,
    pub people_reached: u32,
    pub population_included: f32,
    pub yearly_state: Vec<YearlyState>,
    pub end_reason: String,
    pub total_population: u32,
    pub start_id: u32,
}

// ============================================================
// SOCIAL NETWORK
// ============================================================

struct SocialNetwork {
    total_population: u32,
    avg_connections: f64,
    within_ratio: f64,
    connection_cache: HashMap<u32, Vec<u32>>,
}

impl SocialNetwork {
    fn new(params: &SimParams) -> Self {
        SocialNetwork {
            total_population: params.total_population,
            avg_connections: params.avg_connections,
            within_ratio: params.within_ratio,
            connection_cache: HashMap::new(),
        }
    }

    fn get_connection_counts(&self) -> (u32, u32) {
        let within_f = self.avg_connections * self.within_ratio;
        let frac = within_f.fract();
        let within: u32 = if rng_f64() < frac {
            within_f.ceil() as u32
        } else {
            within_f.floor() as u32
        };
        // between = avgConnections - within (mirrors TS: this.avgConnections - within)
        let between_f = self.avg_connections - within as f64;
        // JS loop `for i < between` runs ceil(between) times for non-integers
        let between = between_f.max(0.0).ceil() as u32;
        (within, between)
    }

    fn clear_cache_of(&mut self, id: u32) {
        self.connection_cache.remove(&id);
    }

    fn get_connections(&mut self, person_id: u32) -> Vec<u32> {
        if let Some(cached) = self.connection_cache.get(&person_id) {
            return cached.clone();
        }

        let mut connections = HashSet::new();
        let (within, between) = self.get_connection_counts();
        let half = (within / 2) as i64;

        for offset in -half..=half {
            if offset == 0 {
                continue;
            }
            let target =
                ((person_id as i64 + offset).rem_euclid(self.total_population as i64)) as u32;
            connections.insert(target);
        }
        for _ in 0..between {
            let r = rng_usize(self.total_population as usize) as u32;
            if r != person_id {
                connections.insert(r);
            }
        }

        let result: Vec<u32> = connections.into_iter().collect();
        self.connection_cache.insert(person_id, result.clone());
        result
    }
}

// ============================================================
// SIMULATION RUNNER
// ============================================================

#[wasm_bindgen]
pub fn run_simulate(
    influence_per_year: f64,
    params: JsValue,
    on_progress: js_sys::Function,
) -> Result<JsValue, JsValue> {
    let params: SimParams =
        serde_wasm_bindgen::from_value(params).map_err(|e| JsValue::from_str(&e.to_string()))?;

    let seed = params.seed.map(|s| s as u64);
    seed_rng(seed); // seed once; all subsequent RNG stays inside WASM

    let mut network = SocialNetwork::new(&params);
    let n = params.total_population as usize;

    // Dense boolean arrays instead of HashSet — O(1) direct index,
    // no hashing, much better cache locality for large populations.
    let mut influenced = vec![false; n];
    let mut influenced_count: usize = 1;

    // next_set: dedup guard; next_vec: fast iteration without collect()
    let mut next_set = vec![false; n];
    let mut next_vec: Vec<u32> = Vec::with_capacity(1024);

    let progress_step = (n as f64 * PROGRESS_THRESHOLD) as usize;
    let mut next_progress_at = progress_step;

    let start = rng_usize(n) as u32;
    influenced[start as usize] = true;
    let mut active = vec![start];
    let mut year: u32 = 0;
    let mut growth: Vec<YearlyState> = Vec::new();
    let mut end_reason = "everyone_reached";

    while !active.is_empty() && influenced_count < n {
        year += 1;
        next_set.fill(false);
        next_vec.clear();
        let mut exhausted = true;
        let mut ancestors: Option<Vec<(u32, u32)>> = if params.track_ancestors {
            Some(Vec::new())
        } else {
            None
        };

        while !active.is_empty() && influenced_count < n {
            let reached = influenced_count;
            if reached >= next_progress_at {
                next_progress_at = reached + progress_step;
                let _ = on_progress.call2(
                    &JsValue::NULL,
                    &JsValue::from(year),
                    &JsValue::from(reached),
                );
            }

            // Randomly select an active influencer and swap remove
            let i = rng_usize(active.len());
            let influencer = active[i];
            active.swap_remove(i);

            let conns = network.get_connections(influencer);
            let mut available: Vec<u32> = conns
                .iter()
                .filter(|&&c| !influenced[c as usize])
                .cloned()
                .collect();

            if !available.is_empty() {
                exhausted = false;
            }

            if available.len() > influence_per_year as usize {
                if !next_set[influencer as usize] {
                    next_set[influencer as usize] = true;
                    next_vec.push(influencer);
                }
            } else {
                network.clear_cache_of(influencer);
            }

            let mut to_influence = influence_per_year.min(available.len() as f64);
            if to_influence.fract() != 0.0 {
                to_influence = if rng_f64() < influence_per_year.fract() {
                    to_influence.ceil()
                } else {
                    to_influence.floor()
                };
            }
            let to_influence = to_influence as usize;
            for _ in 0..to_influence {
                let i = rng_usize(available.len());
                let id = available[i] as usize;
                available.swap_remove(i);
                if !influenced[id] {
                    influenced[id] = true;
                    ancestors.as_mut().map(|a| a.push((influencer, id as u32)));
                    influenced_count += 1;
                }
                if !next_set[id] {
                    next_set[id] = true;
                    next_vec.push(id as u32);
                }
            }
        }

        if exhausted {
            end_reason = "network_saturation";
            break;
        }
        growth.push(YearlyState::new(influenced_count as u32 - 1, ancestors));
        let _ = on_progress.call2(
            &JsValue::NULL,
            &JsValue::from(year),
            &JsValue::from(influenced_count as u32),
        );
        active = next_vec.clone();
        if year >= params.max_years {
            end_reason = "max_time";
            break;
        }
    }

    let result = SimResult {
        years: growth.len() as u32,
        people_reached: influenced_count as u32 - 1,
        population_included: influenced_count as f32 / n as f32,
        yearly_state: growth,
        end_reason: end_reason.to_string(),
        total_population: params.total_population,
        start_id: start,
    };

    serde_wasm_bindgen::to_value(&result).map_err(|e| JsValue::from_str(&e.to_string()))
}

// keep default test stub happy:
pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
