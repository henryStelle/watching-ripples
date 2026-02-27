/* eslint-disable react-refresh/only-export-components */
/**
 * Step 3 - Purely local connections (withinRatio = 1)
 *
 * Introduces network structure by showing the simplest case: every
 * friendship is local - your friends are your neighbours on the ring.
 * Influence creeps outward one neighbourhood at a time and the far side
 * of the circle is never reached within the time limit.
 *
 * Sets up the contrast for Step 4, which adds bridge connections.
 */

import type { SimParams } from "../../types";
import type { GuessInputConfig, PromptProps, ResultProps } from "../types";
import { RimGraph } from "../visualizers/RimGraph";
import { LinearGrowthChart } from "../visualizers/LinearGrowthChart";
import { YEAR_COLORS } from "../stepUtils";

export const TUTORIAL_PARAMS: SimParams = {
  influencePerYear: 4,
  totalPopulation: 50,
  avgConnections: 4,
  withinRatio: 1.0, // all connections are local - no bridges whatsoever
  maxYears: 5,
  trackAncestors: true,
  seed: 42,
};

// ── Prompt ─────────────────────────────────────────────────────────────────

export function Prompt({ params }: PromptProps) {
  const { avgConnections, influencePerYear, maxYears, totalPopulation } =
    params;

  return (
    <div className="flex flex-col gap-4 text-gray-700 leading-relaxed">
      <h2 className="text-xl font-bold text-gray-900">
        Step 3: What if everyone only knew their neighbours?
      </h2>
      <p>
        So far we've focused on <em>how many</em> people you influence each
        year. Now let's look at <em>who</em> those people are.
      </p>
      <p>
        Imagine a small town where everyone grew up together. Your{" "}
        {avgConnections} close friends are all friends with each other too - you
        were all at the same school, the same street, the same club. In network
        terms, your friendships are entirely <strong>local</strong>: every
        connection you have is with someone already inside your cluster.
      </p>
      <p>
        We can picture this as a ring of {totalPopulation} people. Each person
        knows only their immediate neighbours and nobody else. When an idea
        starts somewhere on that ring, it can only travel by creeping along the
        edge - one neighbourhood at a time, spreading outward in both directions
        from where it began.
      </p>
      <p>
        With{" "}
        <strong className="text-primary">
          {influencePerYear} people influenced per year
        </strong>{" "}
        and <strong>{maxYears} years</strong> on the clock, how many of the{" "}
        {totalPopulation} people do you think the idea will reach?
      </p>
    </div>
  );
}

export const guessInput: GuessInputConfig = {
  label: (
    <span>
      After <strong>{TUTORIAL_PARAMS.maxYears} years</strong>, how many of the{" "}
      {TUTORIAL_PARAMS.totalPopulation} people will have been influenced -{" "}
      <em>not counting yourself?</em>
    </span>
  ),
  placeholder: "Enter your guess",
  min: 0,
  max: TUTORIAL_PARAMS.totalPopulation - 1,
  step: 1,
};

// ── Result ──────────────────────────────────────────────────────────────────

export function Result({ result, params }: ResultProps) {
  const { avgConnections, totalPopulation } = params;
  const totalReached = result.peopleReached;
  const pct = (result.populationIncluded * 100).toFixed(1);
  const yearsRan = result.years;
  const unreached = totalPopulation - totalReached - 1;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3">
          Scrub through the years to watch the wave creep around the ring
        </h3>
        <RimGraph result={result} params={params} yearColors={YEAR_COLORS} />
      </div>

      <div className="flex flex-col gap-3 text-gray-700 text-sm leading-relaxed bg-emerald-50 border-l-4 border-primary px-4 py-4 rounded">
        <p>
          Notice the shape: a solid arc of colour, then an abrupt edge, then
          grey. That edge is the frontier - the furthest point the idea has
          reached. Beyond it, every person's {avgConnections} friends are all
          uninfluenced, but the wave simply hasn't arrived yet. Given enough
          years it would get there; the problem is purely one of{" "}
          <em>distance</em>.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3">
          Total people reached each year, by wave
        </h3>
        <LinearGrowthChart
          result={result}
          params={params}
          yearColors={YEAR_COLORS}
        />
      </div>

      <div className="flex flex-col gap-3 text-gray-700 text-sm leading-relaxed bg-emerald-50 border-l-4 border-primary px-4 py-4 rounded">
        <p>
          After {yearsRan} years the idea reached{" "}
          <strong>
            {totalReached} people ({pct}%)
          </strong>
          , with <strong>{unreached} people</strong> on the far side of the ring
          still untouched. Each coloured segment in the chart is a wave - and
          every wave adds the same number of people every year. That's{" "}
          <strong>linear growth</strong>: the wave front advances by a fixed
          number of steps per year, regardless of how many people are already
          reached.
        </p>
        <p>
          In a world of purely local friendships, influence spreads like a
          ripple in still water: steady, predictable, and fundamentally limited
          by how far the wave front can travel. The idea cannot "jump" - it can
          only move one neighbourhood at a time.
        </p>
        <p>
          What would it take to reach those grey nodes faster? That's what we'll
          explore in the next step.
        </p>
      </div>
    </div>
  );
}
