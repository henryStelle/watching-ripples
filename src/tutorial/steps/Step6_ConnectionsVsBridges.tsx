/**
 * Step 6 - Which matters more: relationships per person or bridge rate?
 *
 * Keep the bridge rate the same as Step 5 but reduce `avgConnections` back
 * down to 2 and run for a long time (30 years). This shows whether the
 * density of local relationships or the (rare) long-range bridges drive
 * long-term spread more strongly.
 */

import type { PromptProps, ResultProps } from "../types";
import SimParamsPanel from "../visualizers/SimParamsPanel";
import MultiResultLineChart from "../visualizers/MultiResultLineChart";
import { usePrevSnapshot } from "../TutorialContext";
import * as configs from "./configs";

export function Prompt({ params }: PromptProps) {
  const { avgConnections, withinRatio } = params;
  const betweenPct = (1 - withinRatio).toLocaleString([], { style: "percent" });

  return (
    <div className="flex flex-col gap-4 text-gray-700 leading-relaxed">
      <h2 className="text-xl font-bold text-gray-900">
        Step 6: Relationships vs bridges
      </h2>
      <p>
        We've identified two knobs that affect growth: how many relationships
        each person has, and the small fraction of relationships that act as
        long-range bridges. Which of these matters more over the long run?
      </p>
      <p>
        In this experiment we keep the bridge rate the same as the previous step
        ({betweenPct} of connections), but reduce each person's average
        relationships back to <strong>{avgConnections}</strong>. We also extend
        the simulation to ensure we see the long-term behavior.
      </p>

      <p>
        If reducing relationships per person drastically slows spread even with
        the same number of bridges, then network density is the dominant factor.
        If spread still reaches large fractions given enough time, then rare
        bridges can compensate for sparse local connectivity.
      </p>

      <SimParamsPanel params={params} prevParams={configs.step5} />
    </div>
  );
}

const prevResultsLabel = `${configs.step5.avgConnections} relationships / person`;
const thisResultsLabel = `${configs.step6.avgConnections} relationships / person`;

export function Result({ result, idx }: ResultProps) {
  const totalReached = result.peopleReached;
  const yearsRan = result.years;
  const prevSnap = usePrevSnapshot(idx);
  const prevReached = prevSnap.result.peopleReached;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 text-gray-700 text-sm leading-relaxed bg-emerald-50 border-l-4 border-primary px-4 py-4 rounded">
        <p>
          This run reached <strong>{totalReached} people</strong> in {yearsRan}{" "}
          years. Compare that to the previous step's{" "}
          <strong>{prevReached}</strong> in {prevSnap.result.years} years.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3">
          Cumulative reach over time
        </h3>
        <MultiResultLineChart
          results={[prevSnap.result, result]}
          labels={[prevResultsLabel, thisResultsLabel]}
        />
      </div>

      <div className="flex flex-col gap-3 text-gray-700 text-sm leading-relaxed bg-emerald-50 border-l-4 border-primary px-4 py-4 rounded">
        <p>
          Reducing the number of relationships per person clearly significantly
          slows down the spread. However, the important thing to notice is that
          the curve is the same shape - it just takes (much) longer to get
          going.
        </p>
      </div>
    </div>
  );
}
