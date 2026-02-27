/**
 * Step 4 - One bridge fires in Year 2, doubling the active fronts
 *
 * Identical to Step 3 except withinRatio < 1 allows one long-range bridge
 * to fire in Year 2. That single jump plants a new beachhead on the far
 * side of the ring, turning 2 active fronts into 4 and doubling new-per-year
 * from 4 to 8. Total reach goes from 20 (Step 3) to 32.
 */

import type { PromptProps, ResultProps } from "../types";
import { RimGraph } from "../visualizers/RimGraph";
import { LinearGrowthChart } from "../visualizers/LinearGrowthChart";
import { YEAR_COLORS } from "../stepUtils";
import { usePrevSnapshot } from "../TutorialContext";

// ── Prompt ─────────────────────────────────────────────────────────────────

export function Prompt({ params, idx }: PromptProps) {
  const { avgConnections, influencePerYear, maxYears, totalPopulation } =
    params;
  const betweenPct = (1 - params.withinRatio).toLocaleString([], {
    style: "percent",
  });
  const prevSnap = usePrevSnapshot(idx);
  const prevReached = prevSnap.result.peopleReached;
  const prevNewPerYear = prevSnap.result.yearlyState[0]?.influenced ?? 0;

  return (
    <div className="flex flex-col gap-4 text-gray-700 leading-relaxed">
      <h2 className="text-xl font-bold text-gray-900">
        Step 4: One friend out of town
      </h2>
      <p>
        In the last step, the wave crept steadily around the ring and reached{" "}
        <strong>{prevReached} people</strong> in {maxYears} years -{" "}
        {prevNewPerYear} new people every year, no more, no less. The far side
        stayed grey.
      </p>
      <p>
        Now we make one small change. A tiny fraction (just {betweenPct}) of
        connections are allowed to "jump" to a random stranger elsewhere on the
        ring - someone completely outside of your local neighborhood. Think of
        it as the friend who moved to another city: you still talk regularly,
        they just don't know any of your other friends.
      </p>
      <p>
        Everything else stays the same: {avgConnections} connections per person,{" "}
        {influencePerYear} people influenced per year, {maxYears} years,{" "}
        {totalPopulation} people on the ring. The only difference is that
        occasionally one of those connections reaches across the circle instead
        of to a neighbor.
      </p>
      <p>How many people do you think the idea reaches this time?</p>
    </div>
  );
}

// ── Result ──────────────────────────────────────────────────────────────────

export function Result({ result, params, idx }: ResultProps) {
  const { totalPopulation } = params;
  const totalReached = result.peopleReached;
  const pct = (result.populationIncluded * 100).toFixed(1);
  const yearsRan = result.years;
  const unreached = totalPopulation - totalReached - 1;
  const prevSnap = usePrevSnapshot(idx);
  const prevReached = prevSnap.result.peopleReached;

  // new people per year from the sim
  const newPerYear = result.yearlyState.map((state, i) => {
    const prev = i === 0 ? 0 : result.yearlyState[i - 1].influenced;
    return state.influenced - prev;
  });
  const year2New = newPerYear[1] ?? 0;
  const bridgeFired = year2New > (newPerYear[0] ?? 0);
  const frontsBeforeBridge = newPerYear[0] ?? 0;
  const frontsAfterBridge = newPerYear[2] ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3">
          Spot the jump in Year 2
        </h3>
        <RimGraph result={result} yearColors={YEAR_COLORS} />
      </div>

      <div className="flex flex-col gap-2 text-gray-700 text-sm leading-relaxed bg-emerald-50 border-l-4 border-primary px-4 py-4 rounded">
        <p>
          At Year 2, look for a long chord leaping across the ring. That's the a
          relationship bridging between communities - someone's out-of-town
          friend heard the idea and carried it to a completely different part of
          the network. A new arc immediately starts growing from that landing
          point, spreading locally from there just as yours did from the start.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3">
          Total people reached each year, by wave
        </h3>
        <LinearGrowthChart result={result} yearColors={YEAR_COLORS} />
      </div>

      <div className="flex flex-col gap-3 text-gray-700 text-sm leading-relaxed bg-emerald-50 border-l-4 border-primary px-4 py-4 rounded">
        {bridgeFired && (
          <p>
            Before the bridge:{" "}
            <strong>{frontsBeforeBridge} active fronts</strong>, adding{" "}
            <strong>{frontsBeforeBridge} new people per year</strong>. After the
            bridge lands in Year 2:{" "}
            <strong>{frontsAfterBridge} active fronts</strong>, adding{" "}
            <strong>{frontsAfterBridge} new people per year</strong>. The rate
            doubled - not because anyone changed their behavior, but because the
            idea now has twice as many nodes pushing into uncharted territory.
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
          . Compare that to Step 3's {prevReached}: the setup is nearly
          identical, the only difference is one friend who lives far away.
        </p>
        <p>
          <strong>Reflection:</strong> Bridging between communities might mean
          communities that are physically far apart - like the friend who lives
          in another town or region. However, it can also mean communities that
          are culturally, politically, ethnically, or socially distant. This
          applies to any groups of people that have limited meaningful
          relationships between them, even if they live in the same city.
        </p>
      </div>
    </div>
  );
}
