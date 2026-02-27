import type { SimParams, SimResult } from "../types";

// ─────────────────────────────────────────────────────────────
// Props for override-only steps (e.g. Intro).
// The step gets navigation and nothing else — it renders itself.
// ─────────────────────────────────────────────────────────────
export interface OverrideProps {
  onAdvance: () => void;
  onBack: () => void;
}

// ─────────────────────────────────────────────────────────────
// Props injected into a step's Result component by StepRunner.
// ─────────────────────────────────────────────────────────────
export interface ResultProps {
  result: SimResult;
  params: SimParams;
}

// ─────────────────────────────────────────────────────────────
// Config for the guess input field — the only thing that varies
// between steps for the input widget.
// ─────────────────────────────────────────────────────────────
export interface GuessInputConfig {
  label: string;
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
// To add a new standard step:
//   1. Create a file in steps/ that exports Prompt, guessInput, Result,
//      plus the fixed sim constants (simParams, influencePerYear).
//   2. Add a TutorialStepDef entry to steps/index.ts.
//   Nothing else changes.
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
      influencePerYear: number;
      /** Explains the setup and poses the question */
      Prompt: React.ComponentType;
      guessInput: GuessInputConfig;
      /** Explains why the simulation produced the result it did */
      Result: React.ComponentType<ResultProps>;
    };
