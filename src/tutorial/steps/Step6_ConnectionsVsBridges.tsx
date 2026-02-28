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
  const { avgConnections } = params;

  return (
    <div className="flex flex-col gap-4 text-gray-700 leading-relaxed">
      <h2 className="text-xl font-bold text-gray-900">
        Step 6: What if each person knows fewer people?
      </h2>
      <p>
        We've identified two knobs that affect growth: how many relationships
        each person has, and the small fraction of relationships that act as
        long-range bridges. Which of these matters more over the long run?
      </p>
      <p>
        To test it, let's cut relationships per person back down to{" "}
        <strong>{avgConnections}</strong>. The bridge rate stays exactly the
        same. Only the size of each person's local circle changes.
      </p>
      <p>
        We'll also let the simulation run for longer to give the network enough
        time to show what it can do.
      </p>

      <SimParamsPanel params={params} prevParams={configs.step5} />
    </div>
  );
}

const prevResultsLabel = `${configs.step5.avgConnections} relationships / person`;
const thisResultsLabel = `${configs.step6.avgConnections} relationships / person`;

const intl = new Intl.NumberFormat([]);
export function Result({ result, idx }: ResultProps) {
  const totalReached = result.peopleReached;
  const yearsRan = result.years;
  const prevSnap = usePrevSnapshot(idx);
  const prevReached = prevSnap.result.peopleReached;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3">
          Total reach over time
        </h3>
        <MultiResultLineChart
          results={[prevSnap.result, result]}
          labels={[prevResultsLabel, thisResultsLabel]}
        />
      </div>

      <div className="flex flex-col gap-3 text-gray-700 text-sm leading-relaxed bg-emerald-50 border-l-4 border-primary px-4 py-4 rounded">
        <p>
          With fewer connections per person, the idea reached{" "}
          <strong>{intl.format(totalReached)} people</strong> in {yearsRan}{" "}
          years — compared to <strong>{intl.format(prevReached)}</strong> in{" "}
          {prevSnap.result.years} years in the previous step. That's a dramatic
          slowdown.
        </p>
        <p>
          Here's the important part though: look at the <em>shape</em> of both
          curves. They both accelerate over time — the growth is still
          exponential. Fewer local connections means each cluster fills up more
          slowly, so the bridges get less "fuel" to carry the idea forward. But
          the bridges are still working. The pattern is the same; it just takes
          much longer to play out.
        </p>
        <p>
          More connections speed things up — significantly. But the thing that
          makes the difference between local fizzle and global reach isn't how
          big your circle is. It's whether any of those connections lead
          somewhere new.
        </p>
      </div>
    </div>
  );
}
