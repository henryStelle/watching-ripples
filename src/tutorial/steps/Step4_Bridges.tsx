/* eslint-disable react-refresh/only-export-components */
/**
 * Step 4 - One bridge fires in Year 2, doubling the active fronts
 *
 * Identical to Step 3 except withinRatio < 1 allows one long-range bridge
 * to fire in Year 2. That single jump plants a new beachhead on the far
 * side of the ring, turning 2 active fronts into 4 and doubling new-per-year
 * from 4 to 8. Total reach goes from 20 (Step 3) to 32.
 */

import type { SimParams } from "../../types";
import type { GuessInputConfig, PromptProps, ResultProps } from "../types";
import { RimGraph } from "../visualizers/RimGraph";
import { LinearGrowthChart } from "../visualizers/LinearGrowthChart";
import { YEAR_COLORS } from "../stepUtils";

// Identical to Step 3 except withinRatio drops from 1.0 to 0.99
export const TUTORIAL_PARAMS: SimParams = {
  influencePerYear: 4,
  totalPopulation: 50,
  avgConnections: 4,
  withinRatio: 0.97, // 3% of connections are long-range bridges
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
        Step 4: One friend out of town
      </h2>
      <p>
        In the last step, the wave crept steadily around the ring and reached{" "}
        <strong>20 people</strong> in {maxYears} years - 4 new people every
        year, no more, no less. The far side stayed grey.
      </p>
      <p>
        Now we make one small change. A tiny fraction of connections are allowed
        to "jump" to a random stranger elsewhere on the ring - someone
        completely outside of your local neighbourhood. Think of it as the
        friend who moved to another city: you still talk regularly, they just
        don't know any of your other friends.
      </p>
      <p>
        Everything else stays the same: {avgConnections} connections per person,{" "}
        {influencePerYear} people influenced per year, {maxYears} years,{" "}
        {totalPopulation} people on the ring. The only difference is that
        occasionally one of those connections reaches across the circle instead
        of to a neighbour.
      </p>
      <p>How many people do you think the idea reaches this time?</p>
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
  const { totalPopulation } = params;
  const totalReached = result.peopleReached;
  const pct = (result.populationIncluded * 100).toFixed(1);
  const yearsRan = result.years;
  const unreached = totalPopulation - totalReached - 1;

  // new people per year from the sim
  const newPerYear = result.yearlyState.map((state, i) => {
    const prev = i === 0 ? 0 : result.yearlyState[i - 1].influenced;
    return state.influenced - prev;
  });
  const year2New = newPerYear[1] ?? 0;
  const bridgeFired = year2New > (newPerYear[0] ?? 0);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3">
          Scrub to Year 2 - spot the long chord
        </h3>
        <RimGraph result={result} params={params} yearColors={YEAR_COLORS} />
      </div>

      <div className="flex flex-col gap-2 text-gray-700 text-sm leading-relaxed bg-emerald-50 border-l-4 border-primary px-4 py-4 rounded">
        <p>
          At Year 2, look for a long chord leaping across the ring. That's the
          bridge firing - someone's out-of-town friend heard the idea and
          carried it to a completely different part of the network. A new arc
          immediately starts growing from that landing point, spreading locally
          from there just as yours did from the start.
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
        {bridgeFired && (
          <p>
            Before the bridge: <strong>2 active fronts</strong>, adding{" "}
            <strong>4 new people per year</strong>. After the bridge lands in
            Year 2: <strong>4 active fronts</strong>, adding{" "}
            <strong>8 new people per year</strong>. The rate doubled - not
            because anyone changed their behaviour, but because the idea now has
            twice as many edges pushing into uncharted territory.
          </p>
        )}
        <p>
          The final count is{" "}
          <strong>
            {totalReached} people ({pct}%)
          </strong>{" "}
          in {yearsRan} years
          {unreached > 0 ? (
            <>, leaving {unreached} unreached</>
          ) : (
            <> - the entire network</>
          )}
          . Compare that to Step 3's 20: the setup is identical, the only
          difference is one friend who lives far away.
        </p>
        <p>
          Notice what happened on the bar chart at Year 3: the stack grows
          visibly taller. That's the moment the new arcs hit their stride. The
          extra segment doesn't appear because more people started trying - it
          appears because there are now more <em>places</em> where the idea is
          actively spreading at once.
        </p>
      </div>
    </div>
  );
}
