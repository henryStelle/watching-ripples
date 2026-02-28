/**
 * Step 5 - Let the simulation keep running on a much larger ring
 *
 * Uses the same basic setup as Step 4 (a few long-range bridges) but runs
 * for more years on a larger population so you can see how small early
 * differences cascade over time.
 */

import type { PromptProps, ResultProps } from "../types";
import { LinearGrowthChart } from "../visualizers/LinearGrowthChart";
import SimParamsPanel from "../visualizers/SimParamsPanel";
import * as configs from "./configs";
import { YEAR_COLORS } from "../stepUtils";
import { usePrevSnapshot } from "../TutorialContext";
import { useMemo } from "react";

// ── Prompt ─────────────────────────────────────────────────────────────────

export function Prompt({ params }: PromptProps) {
  const { avgConnections } = params;

  return (
    <div className="flex flex-col gap-4 text-gray-700 leading-relaxed">
      <h2 className="text-xl font-bold text-gray-900">
        Step 5: Let it keep running
      </h2>
      <p>
        Previously, the network was small and the story was easy to follow: a
        single bridge in Year 2 doubled the number of active fronts and the
        yearly growth rate. That produced a visible jump in the small ring you
        saw earlier.
      </p>
      <p>
        However, most people have more than {configs.step4.avgConnections}{" "}
        relationships. So let's increase that to {avgConnections}.
      </p>
      <p>
        Also, we artifically capped the population and simulation years to make
        the effects fit on the ring, but in reality there are many more people
        and more time for the ripple to spread. So let's increase the total
        population and let it run for longer.
      </p>
      <p>
        Everything else stays the same. How different will the final reach look
        once the system has more room and more time to grow?
      </p>

      <SimParamsPanel params={params} prevParams={configs.step4} />
    </div>
  );
}

// ── Result ──────────────────────────────────────────────────────────────────

const intl = new Intl.NumberFormat([]);
export function Result({ params, result, idx }: ResultProps) {
  const totalReached = result.peopleReached;
  const yearsRan = result.years;
  const prevSnap = usePrevSnapshot(idx);
  const prevReached = prevSnap.result.peopleReached;

  const initiatorStats = useMemo(() => {
    // find the last year when the start id is still influencing new people
    // and the total number of people directed influenced by the start id
    let totalInfluenced = 0;
    let lastYearWithNewInfluence = 0;
    for (let i = result.yearlyState.length - 1; i >= 0; i--) {
      const year = result.yearlyState[i];
      const influencedThisYear =
        year.ancestors?.reduce((agg, [influencer]) => {
          if (influencer === result.startId) {
            return agg + 1;
          }
          return agg;
        }, 0) ?? 0;
      if (influencedThisYear > 0) {
        totalInfluenced += influencedThisYear;
        lastYearWithNewInfluence = Math.max(lastYearWithNewInfluence, i + 1);
      }
    }
    return {
      years: lastYearWithNewInfluence,
      totalInfluenced,
    };
  }, [result]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3">
          Total people reached each year, by wave
        </h3>
        <LinearGrowthChart result={result} yearColors={YEAR_COLORS} />
      </div>

      <div className="flex flex-col gap-3 text-gray-700 text-sm leading-relaxed bg-emerald-50 border-l-4 border-primary px-4 py-4 rounded">
        <p>
          The final count is <strong>{intl.format(totalReached)} people</strong>{" "}
          in {yearsRan} years . Compare that to the previous step's{" "}
          {prevReached}.
        </p>
        <p>
          Your first reaction is likely surprise bordering on disbelief. How
          could one person influencing just {params.influencePerYear} people per
          year possibly reach so many? That doesn't seem to match my own
          experiences.
        </p>
        <p>
          The key insight is that it isn't one person doing all the work. It's a
          whole network of people, each influencing a few others, and those
          people in turn influencing a few more, and so on. If fact, the person
          at the centre (you) has run out of new people to influence after just{" "}
          {initiatorStats.years} years because all of your friends have already
          worked to help influence each other. In fact, you{" "}
          <strong>
            directly influenced only {initiatorStats.totalInfluenced} people
          </strong>{" "}
          — the rest of the growth is entirely due to the network effect.
        </p>
      </div>
    </div>
  );
}
