import { run_simulate } from "./wasm-sim/watching_ripples.js";
import type { SimParams, SimResult } from "./types";

/**
 * WASM-backed version of runSimulate.
 * Drop-in replacement for the TypeScript implementation in simulation.ts.
 * Runs synchronously inside the JS engine (no async/await needed).
 */
export function runSimulateWasm(
  influencePerYear: number,
  params: SimParams,
  onProgress: (year: number, reached: number) => void,
): SimResult {
  // serde-wasm-bindgen expects camelCase keys, matching our #[serde(rename_all="camelCase")]
  const wasmParams = {
    totalPopulation: params.totalPopulation,
    avgConnections: params.avgConnections,
    withinRatio: params.withinRatio,
    maxYears: params.maxYears,
  };

  const result = run_simulate(influencePerYear, wasmParams, onProgress);
  return result as SimResult;
}
