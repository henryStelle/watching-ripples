import type { SimParams, SimResult, Status } from "../types";
import { ResultsContent } from "./ResultsContent";
import { SimulationStory } from "./SimulationStory";

interface ResultsPanelProps {
  status: Status;
  loadingMsg: string;
  loadingProgress: number;
  result: SimResult | null;
  storyParams: SimParams;
}

export function ResultsPanel({
  status,
  loadingMsg,
  loadingProgress,
  result,
  storyParams,
}: ResultsPanelProps) {
  return (
    <div className="mt-8 bg-linear-to-br from-green-50 to-emerald-100 p-4 pt-5 md:p-8 rounded-lg border-2 border-primary flex flex-col gap-4 animate-slide-in">
      <h2 id="results" className="text-primary text-3xl font-bold">
        Your Ripple Effect
      </h2>

      {status === "loading" && (
        <div className="flex flex-col gap-2 items-center justify-center py-5">
          <p className="text-xl text-primary text-center">{loadingMsg}</p>
          <div className="w-full md:w-2/3 bg-gray-300 rounded-full h-4 overflow-hidden">
            <div
              className="bg-primary h-4 rounded-full"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {status === "done" && result && (
        <ResultsContent result={result} params={storyParams} />
      )}

      <div className="bg-white shadow p-5 rounded-md text-gray-600 leading-relaxed">
        <strong className="text-lg text-gray-800">
          How this simulation works:
        </strong>
        <SimulationStory params={storyParams} />
      </div>
    </div>
  );
}
