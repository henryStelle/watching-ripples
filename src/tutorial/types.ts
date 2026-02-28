import type { ReactNode } from "react";
import type { SimParams, SimResult, Status } from "../types";

export interface OverrideProps {
  onAdvance: (skipToEnd?: boolean) => void;
  onBack: () => void;
  runSim: (params: SimParams) => void;
  resetSim: () => void;
  simStatus: Status;
  simResult: SimResult | null;
}

export interface PromptProps {
  params: SimParams;
  idx: number;
}
export interface ResultProps {
  result: SimResult;
  params: SimParams;
  idx: number;
}

// ─────────────────────────────────────────────────────────────
// Config for the guess input field — the only thing that varies
// between steps for the input widget.
// ─────────────────────────────────────────────────────────────
export interface GuessInputConfig {
  label: ReactNode;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

// ─────────────────────────────────────────────────────────────
// TutorialStepDef — discriminated union
//
// Variant A: fullOverride
//   The step renders everything itself (used for Intro).
//
// Variant B: standard step
//   The step declares three pieces; StepRunner assembles them:
//     • Prompt     — stateless component explaining the question
//     • guessInput — config for the guess <input>
//     • Result     — component that explains *why* the answer is
//                    what it is; receives result + params
//
// ─────────────────────────────────────────────────────────────
export type TutorialStepDef =
  | {
      label: string;
      fullOverride: React.ComponentType<OverrideProps>;
    }
  | {
      label: string;
      fullOverride?: never;
      simParams: SimParams;
      configNotBuildFromPrevStep?: boolean;
      /** Explains the setup and poses the question */
      Prompt: React.ComponentType<PromptProps>;
      guessInput: GuessInputConfig;
      /** Explains why the simulation produced the result it did */
      Result: React.ComponentType<ResultProps>;
    };
