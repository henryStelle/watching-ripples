import type { SimParams, SimResult } from "./types";

// ============================================================
// HELPERS
// ============================================================

export function makeTimer(duration: number) {
  let start = performance.now();
  return () => {
    const done = performance.now() - start >= duration;
    if (done) start = performance.now();
    return done;
  };
}

export function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const sleep = (ms: number) =>
  new Promise<void>((r) => setTimeout(r, ms));

// ============================================================
// SOCIAL NETWORK
// ============================================================

export class SocialNetwork {
  totalPopulation: number;
  avgConnections: number;
  withinRatio: number;
  connectionCache: Map<number, number[]>;

  constructor(params: SimParams) {
    this.totalPopulation = params.totalPopulation;
    this.avgConnections = params.avgConnections;
    this.withinRatio = params.withinRatio;
    this.connectionCache = new Map();
  }

  getConnectionCounts() {
    let within = this.avgConnections * this.withinRatio;
    within =
      Math.random() < within % 1 ? Math.ceil(within) : Math.floor(within);
    return { within, between: this.avgConnections - within };
  }

  clearCacheOf(id: number) {
    this.connectionCache.delete(id);
  }

  getConnections(personId: number): number[] {
    if (this.connectionCache.has(personId))
      return this.connectionCache.get(personId)!;

    const connections = new Set<number>();
    const { within, between } = this.getConnectionCounts();
    const half = Math.floor(within / 2);

    for (let offset = -half; offset <= half; offset++) {
      if (offset === 0) continue;
      connections.add(
        (personId + offset + this.totalPopulation) % this.totalPopulation,
      );
    }
    for (let i = 0; i < between; i++) {
      const r = Math.floor(Math.random() * this.totalPopulation);
      if (r !== personId) connections.add(r);
    }
    const result = Array.from(connections);
    this.connectionCache.set(personId, result);
    return result;
  }
}

// ============================================================
// SIMULATION RUNNER
// ============================================================

export async function runSimulate(
  influencePerYear: number,
  params: SimParams,
  onProgress: (year: number, reached: number) => void,
): Promise<SimResult> {
  const network = new SocialNetwork(params);
  const tick = makeTimer(100);
  const start = Math.floor(Math.random() * params.totalPopulation);
  const influenced = new Set<number>([start]);
  let active = [start];
  let year = 0;
  const growth: { people: number }[] = [];
  let endReason: SimResult["endReason"] = "everyone_reached";

  while (active.length > 0 && influenced.size < params.totalPopulation) {
    year++;
    const next = new Set<number>();
    let exhausted = true;

    for (const influencer of shuffleArray([...active])) {
      if (influenced.size >= params.totalPopulation) break;

      if (tick()) {
        await sleep(0);
        onProgress(year, influenced.size);
      }

      const conns = network.getConnections(influencer);
      let available = conns.filter((c) => !influenced.has(c));
      if (available.length > 0) exhausted = false;

      if (available.length > influencePerYear) {
        available = shuffleArray(available);
        next.add(influencer);
      } else {
        network.clearCacheOf(influencer);
      }

      let toInfluence = Math.min(influencePerYear, available.length);
      if (toInfluence % 1 !== 0) {
        toInfluence =
          Math.random() < influencePerYear % 1
            ? Math.ceil(toInfluence)
            : Math.floor(toInfluence);
      }
      for (let i = 0; i < toInfluence; i++) {
        influenced.add(available[i]);
        next.add(available[i]);
      }
    }

    if (exhausted) {
      endReason = "network_saturation";
      break;
    }
    growth.push({ people: influenced.size - 1 });
    active = Array.from(next);
    if (year >= params.maxYears) {
      endReason = "max_time";
      break;
    }
  }

  return {
    years: growth.length,
    peopleReached: influenced.size - 1,
    populationIncluded: influenced.size / params.totalPopulation,
    yearlyGrowth: growth,
    endReason,
    totalPopulation: params.totalPopulation,
  };
}
