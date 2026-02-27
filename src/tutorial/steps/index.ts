import type { TutorialStepDef } from "../types";
import { Intro } from "./Intro";
import * as Step1 from "./Step1_TwoPeople";

/**
 * The ordered list of tutorial steps.
 *
 * To add a new standard step:
 *   1. Create a new file in this directory that exports:
 *        INFLUENCE_PER_YEAR, TUTORIAL_PARAMS, Prompt, guessInput, Result
 *   2. Add one entry to this array.  Nothing else changes.
 *
 * To add a fullOverride step (like Intro):
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
    influencePerYear: Step1.INFLUENCE_PER_YEAR,
    Prompt: Step1.Prompt,
    guessInput: Step1.guessInput,
    Result: Step1.Result,
  },
  // ─────────────────────────────────────────
  // Future steps — add entries here, e.g.:
  // {
  //   label: "3 Years",
  //   simParams: Step2.TUTORIAL_PARAMS,
  //   influencePerYear: Step2.INFLUENCE_PER_YEAR,
  //   Prompt: Step2.Prompt,
  //   guessInput: Step2.guessInput,
  //   Result: Step2.Result,
  // },
  // ─────────────────────────────────────────
];
