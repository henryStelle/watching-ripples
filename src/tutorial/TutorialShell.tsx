import type { SimParams, SimResult, Status } from "../types";
import type { TutorialStepDef } from "./types";
import { StepRunner } from "./StepRunner";

interface TutorialShellProps {
  steps: TutorialStepDef[];
  stepIndex: number;
  onAdvance: (skip?: boolean) => void;
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
      {/* ── Step progress indicator (not details beyond the current step out of total) ── */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-gray-500 font-medium">
          Step {stepIndex + 1} of {steps.length}: {step.label}
        </p>
        <div className="w-full h-0.5 bg-gray-200 rounded-full" />
      </div>

      {/* ── Active step body ── */}
      {step.fullOverride ? (
        <step.fullOverride
          onAdvance={onAdvance}
          onBack={onBack}
          runSim={runSim}
          resetSim={resetSim}
          simStatus={simStatus}
          simResult={simResult}
        />
      ) : (
        <StepRunner
          key={stepIndex}
          step={step}
          stepIndex={stepIndex}
          onAdvance={() => onAdvance()}
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
