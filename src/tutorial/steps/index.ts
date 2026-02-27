import type { TutorialStepDef } from "../types";
import { Intro } from "./Intro";
import * as Step1 from "./Step1_TwoPeople";
import * as Step2 from "./Step2_LimitedConnections";
import * as Step3 from "./Step3_WithinRatio";
import * as Step4 from "./Step4_Bridges";
import * as configs from "./configs";
import * as questions from "./questions";

/**
 * The ordered list of tutorial steps.
 */
export const TUTORIAL_STEPS: TutorialStepDef[] = [
  {
    label: "Intro",
    fullOverride: Intro,
  },
  {
    label: "First Guess",
    simParams: configs.step1,
    Prompt: Step1.Prompt,
    guessInput: questions.questionStep1,
    Result: Step1.Result,
  },
  // ─────────────────────────────────────────
  {
    label: "Limited Connections",
    simParams: configs.step2,
    Prompt: Step2.Prompt,
    guessInput: questions.questionStep2,
    Result: Step2.Result,
  },
  // ─────────────────────────────────────────
  {
    label: "Bridge Friendships",
    simParams: configs.step3,
    Prompt: Step3.Prompt,
    guessInput: questions.questionStep3,
    Result: Step3.Result,
  },
  // ─────────────────────────────────────────
  {
    label: "One Friend Out of Town",
    simParams: configs.step4,
    Prompt: Step4.Prompt,
    guessInput: questions.questionStep4,
    Result: Step4.Result,
  },
  // ─────────────────────────────────────────
];
