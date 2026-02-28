import type { TutorialStepDef } from "../types";
import { Intro } from "./Intro";
import * as Step1 from "./Step1_TwoPeople";
import * as Step2 from "./Step2_LimitedConnections";
import * as Step3 from "./Step3_WithinRatio";
import * as Step4 from "./Step4_Bridges";
import * as Step5 from "./Step5_ContinueRunning";
import * as Step6 from "./Step6_ConnectionsVsBridges";
import * as Step7 from "./Step7_ZeroBridgesHighConnections";
import * as Step8 from "./Step8_Introvert";
import { Reflection } from "./Step9_Reflection";
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
  {
    label: "Let it keep running",
    simParams: configs.step5,
    Prompt: Step5.Prompt,
    guessInput: questions.questionStep5,
    Result: Step5.Result,
  },
  {
    label: "Relationships vs Bridges",
    simParams: configs.step6,
    Prompt: Step6.Prompt,
    guessInput: questions.questionStep6,
    Result: Step6.Result,
  },
  {
    label: "No Bridges, Dense Network",
    simParams: configs.step7,
    Prompt: Step7.Prompt,
    guessInput: questions.questionStep7,
    Result: Step7.Result,
  },
  // ─────────────────────────────────────────
  {
    label: "The Introvert's Long Game",
    simParams: configs.step8,
    Prompt: Step8.Prompt,
    guessInput: questions.questionStep8,
    Result: Step8.Result,
  },
  // ─────────────────────────────────────────
  {
    label: "Reflection",
    fullOverride: Reflection,
  },
];
