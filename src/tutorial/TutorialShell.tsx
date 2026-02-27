import type { SimParams, SimResult, Status } from "../types";
import type { TutorialStepDef } from "./types";
import { StepRunner } from "./StepRunner";

interface TutorialShellProps {
  steps: TutorialStepDef[];
  stepIndex: number;
  onAdvance: () => void;
  onBack: () => void;
  simStatus: Status;
  simResult: SimResult | null;
  loadingMsg: string;
  loadingProgress: number;
  runSim: (params: SimParams) => void;
  resetSim: () => void;
}

/**
 * TutorialShell
 *
 * Renders:
 *   • A step-progress indicator (dots + labels)
 *   • For fullOverride steps: the step's own component
 *   • For standard steps: StepRunner (which assembles Prompt / input / Result)
 *
 * Deliberately display-only — all business logic lives in AppV2.
 * The `key={stepIndex}` on StepRunner ensures it remounts (and resets)
 * whenever the active step changes.
 */
export function TutorialShell({
  steps,
  stepIndex,
  onAdvance,
  onBack,
  simStatus,
  simResult,
  loadingMsg,
  loadingProgress,
  runSim,
  resetSim,
}: TutorialShellProps) {
  const step = steps[stepIndex];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Progress dots ── */}
      <div className="flex items-center justify-center gap-2 flex-wrap px-4">
        {steps.map((s, i) => {
          const isDone = i < stepIndex;
          const isCurrent = i === stepIndex;
          return (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <div
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  isDone
                    ? "bg-primary text-white"
                    : isCurrent
                      ? "bg-primary text-white ring-2 ring-offset-2 ring-primary"
                      : "bg-gray-200 text-gray-400",
                ].join(" ")}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span
                className={[
                  "text-xs text-center max-w-16 leading-tight",
                  isCurrent ? "text-primary font-semibold" : "text-gray-400",
                ].join(" ")}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Active step body ── */}
      {step.fullOverride ? (
        <step.fullOverride onAdvance={onAdvance} onBack={onBack} />
      ) : (
        <StepRunner
          key={stepIndex}
          step={step}
          onAdvance={onAdvance}
          onBack={onBack}
          simStatus={simStatus}
          simResult={simResult}
          loadingMsg={loadingMsg}
          loadingProgress={loadingProgress}
          runSim={runSim}
          resetSim={resetSim}
        />
      )}
    </div>
  );
}
