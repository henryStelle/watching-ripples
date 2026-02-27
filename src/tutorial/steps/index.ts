import type { TutorialStepDef } from "../types";
import { Intro } from "./Intro";
import * as Step1 from "./Step1_TwoPeople";
import * as Step2 from "./Step2_LimitedConnections";

/**
 * The ordered list of tutorial steps.
 *
 * To add a new standard step:
 *   1. Create a new file in this directory that exports a single
 *      `createStep` function (StepFactory).  It receives the previous
 *      step's simParams and SimResult so it can inherit and build on them.
 *      Define Prompt and Result inside createStep (not as module exports)
 *      to keep files free of mixed exports and avoid HMR warnings.
 *   2. Add one entry to this array.  Nothing else changes.
 *
 * To add a full-override step (like Intro):
 *   1. Create a component satisfying OverrideProps.
 *   2. Add { label, fullOverride: YourComponent } here.
 */
export const TUTORIAL_STEPS: TutorialStepDef[] = [
  {
    label: "Intro",
    fullOverride: Intro,
  },
  {
    label: "First Guess",
    simParams: Step1.TUTORIAL_PARAMS,
    Prompt: Step1.Prompt,
    guessInput: Step1.guessInput,
    Result: Step1.Result,
  },
  // ─────────────────────────────────────────
  {
    label: "Limited Connections",
    simParams: Step2.TUTORIAL_PARAMS,
    Prompt: Step2.Prompt,
    guessInput: Step2.guessInput,
    Result: Step2.Result,
  },
  // ─────────────────────────────────────────
];
