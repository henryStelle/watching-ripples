import { runSimulateWasm } from "./simulation_wasm";
import type { SimParams, SimResult } from "./types";

export type WorkerInMessage = {
  type: "run";
  influencePerYear: number;
  params: SimParams;
};

export type WorkerOutMessage =
  | { type: "progress"; year: number; reached: number }
  | {
      type: "result";
      result: SimResult;
    }
  | { type: "error"; message: string };

self.onmessage = async (event: MessageEvent<WorkerInMessage>) => {
  const { type, influencePerYear, params } = event.data;
  if (type !== "run") return;

  const handleProgress = (year: number, reached: number) => {
    self.postMessage({
      type: "progress",
      year,
      reached,
    } satisfies WorkerOutMessage);
  };

  try {
    // Run WASM simulation
    const result = runSimulateWasm(influencePerYear, params, handleProgress);

    self.postMessage({
      type: "result",
      result,
    } satisfies WorkerOutMessage);
  } catch (err) {
    self.postMessage({
      type: "error",
      message: String(err),
    } satisfies WorkerOutMessage);
  }
};
