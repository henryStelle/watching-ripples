import type { GuessInputConfig } from "../types";
import * as configs from "./configs";

export const questionStep1: GuessInputConfig = {
  label: (
    <span>
      After <strong>{configs.step1.maxYears} years</strong>, how many people
      will have been influenced—
      <em>not counting yourself?</em>
    </span>
  ),
  placeholder: "Enter your guess",
  min: 0,
  step: 1,
};

export const questionStep2: GuessInputConfig = {
  label: (
    <span>
      After <strong>{configs.step2.maxYears} years</strong>, how many people
      will have been influenced—
      <em>not counting yourself?</em>
    </span>
  ),
  placeholder: "Enter your guess",
  min: 0,
  step: 1,
};

export const questionStep3: GuessInputConfig = {
  label: (
    <span>
      After <strong>{configs.step3.maxYears} years</strong>, how many of the{" "}
      {configs.step3.totalPopulation} people will have been influenced -{" "}
      <em>not counting yourself?</em>
    </span>
  ),
  placeholder: "Enter your guess",
  min: 0,
  max: configs.step3.totalPopulation - 1,
  step: 1,
};

export const questionStep4: GuessInputConfig = {
  label: (
    <span>
      After <strong>{configs.step4.maxYears} years</strong>, how many of the{" "}
      {configs.step4.totalPopulation} people will have been influenced -{" "}
      <em>not counting yourself?</em>
    </span>
  ),
  placeholder: "Enter your guess",
  min: 0,
  max: configs.step4.totalPopulation - 1,
  step: 1,
};

export const questionStep5: GuessInputConfig = {
  label: (
    <span>
      After <strong>{configs.step5.maxYears} years</strong>, how many of the{" "}
      {configs.step5.totalPopulation} people will have been influenced -{" "}
      <em>not counting yourself?</em>
    </span>
  ),
  placeholder: "Enter your guess",
  min: 0,
  max: configs.step5.totalPopulation - 1,
  step: 1,
};

export const questionStep6: GuessInputConfig = {
  label: (
    <span>
      After <strong>{configs.step6.maxYears} years</strong>, how many of the{" "}
      {configs.step6.totalPopulation} people will have been influenced -{" "}
      <em>not counting yourself?</em>
    </span>
  ),
  placeholder: "Enter your guess",
  min: 0,
  max: configs.step6.totalPopulation - 1,
  step: 1,
};

export const questionStep7: GuessInputConfig = {
  label: (
    <span>
      After <strong>{configs.step7.maxYears} years</strong>, how many of the{" "}
      {configs.step7.totalPopulation} people will have been influenced -{" "}
      <em>not counting yourself?</em>
    </span>
  ),
  placeholder: "Enter your guess",
  min: 0,
  max: configs.step7.totalPopulation - 1,
  step: 1,
};
