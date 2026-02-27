/**
 * Step 1 — Two people per year, two years
 *
 * This file exports only what is unique to this step:
 *   • INFLUENCE_PER_YEAR + TUTORIAL_PARAMS  (sim config)
 *   • Prompt   (explains the setup, poses the question)
 *   • guessInput  (label/config for the guess field)
 *   • Result   (explains why the answer is what it is, with visualizer)
 *
 * All shared structure (guess form, submit button, loading bar, reveal
 * layout, nav buttons) lives in StepRunner.
 */

import type { SimParams } from "../../types";
import type { GuessInputConfig, ResultProps } from "../types";
import { YearByYearBreakdown } from "../visualizers/YearByYearBreakdown";
import { YEAR_COLORS, Swatch } from "../stepUtils";

// ── Sim constants ──────────────────────────────────────────────────────────

export const INFLUENCE_PER_YEAR = 2;

const MAX_YEARS = 2;

export const TUTORIAL_PARAMS: SimParams = {
  totalPopulation: 10_000,
  avgConnections: 150,
  withinRatio: 1, // totally isolated populations so that growth is consistent and predictable
  maxYears: MAX_YEARS,
  trackAncestors: true,
};

// ── Prompt ─────────────────────────────────────────────────────────────────

export function Prompt() {
  return (
    <div className="flex flex-col gap-4 text-gray-700 leading-relaxed">
      <h2 className="text-xl font-bold text-gray-900">
        Step 1: How influence spreads year by year
      </h2>
      <p>
        The first thing we can configure is{" "}
        <strong>how many people you influence each year</strong>—to the degree
        that they're genuinely convinced and will go on to influence that same
        number of people in the years that follow.
      </p>
      <p>
        For this first run, we'll fix that number at{" "}
        <strong className="text-primary">2 people per year</strong>. You
        influence 2 people in Year 1. Each of those people influences 2 more in
        Year 2. And so on.
      </p>
      <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 rounded text-sm">
        <strong>The question:</strong> After <strong>{MAX_YEARS} years</strong>,
        how many people will have been influenced—
        <em>not counting yourself</em>?
      </div>
    </div>
  );
}

// ── Guess input config ─────────────────────────────────────────────────────

export const guessInput: GuessInputConfig = {
  label: "How many people do you think will be influenced after 2 years?",
  placeholder: "Enter your guess",
  min: 0,
  step: 1,
};

// ── Result ─────────────────────────────────────────────────────────────────

export function Result({ result }: ResultProps) {
  const year1 = result.yearlyState[0]?.influenced ?? 0;
  const year2 = (result.yearlyState[1]?.influenced ?? 0) - year1; // new influenced in year 2

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3">
          How it unfolded, year by year
        </h3>
        <YearByYearBreakdown
          result={result}
          params={TUTORIAL_PARAMS}
          yearColors={YEAR_COLORS}
        />
      </div>

      <div className="flex flex-col gap-3 text-gray-700 text-sm leading-relaxed bg-emerald-50 border-l-4 border-primary px-4 py-4 rounded">
        <p>
          The <Swatch color={YEAR_COLORS[0]} label="amber node" /> at the centre
          is you. In <strong>Year 1</strong> you reached {INFLUENCE_PER_YEAR}{" "}
          people—the <Swatch color={YEAR_COLORS[1]} label="emerald nodes" /> in
          the first ring.
        </p>
        <p>
          In <strong>Year 2</strong>, it wasn't only you spreading the idea. The{" "}
          {year1} {year1 === 1 ? "person" : "people"} you reached in Year 1 each
          became a source too—each influencing {INFLUENCE_PER_YEAR} new people.
          Those are the <Swatch color={YEAR_COLORS[2]} label="sky-blue nodes" />{" "}
          in the outer ring. So instead of adding {INFLUENCE_PER_YEAR} again,
          you get {year2} people in Year 2 as the number of people working to
          spread the idea is {year1 + 1} vs 1.
        </p>
        <p>
          This is the core difference between linear and compound growth. In a
          linear model, only you ever spread the idea. Here, everyone who's been
          reached keeps spreading it.
        </p>
      </div>
    </div>
  );
}
