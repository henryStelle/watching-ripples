/**
 * Step 8 — The introvert's long game.
 *
 * Half a person influenced per year. Three close relationships. One-percent
 * long-range bridges. A world of ten million people. Sixty-five years.
 *
 * The punchline: the exponential shape returns. Even at this modest pace, the
 * bridge mechanism lifts the final reach into the millions — the same
 * pattern as Steps 5 and 6, just on a longer fuse.
 */

import type { PromptProps, ResultProps } from "../types";
import SimParamsPanel from "../visualizers/SimParamsPanel";
import MultiResultLineChart from "../visualizers/MultiResultLineChart";
import * as configs from "./configs";
import { usePrevSnapshot } from "../TutorialContext";

const intl = new Intl.NumberFormat([]);

export function Prompt({ params }: PromptProps) {
  return (
    <div className="flex flex-col gap-4 text-gray-700 leading-relaxed">
      <h2 className="text-xl font-bold text-gray-900">
        Step 8: What about an introvert with a quiet life?
      </h2>
      <p>
        Every step so far has assumed you convince{" "}
        <strong>two people per year</strong>. But what if you're naturally
        reserved — someone who builds a handful of deep, slow-burning
        relationships rather than a wide, energetic network? What if you only
        persuade <strong>half a person per year</strong> on average?
      </p>
      <p>
        We've already seen that bridges — not the size of your circle — are the
        secret sauce. So let's keep that 1 % bridge rate and run this quieter,
        more introverted scenario across ten million people over a full
        lifetime: <strong>{params.maxYears} years</strong>.
      </p>
      <p>
        Even with just{" "}
        <strong>{params.avgConnections} close relationships</strong> and half
        the influence rate, do you think it still reaches millions?
      </p>

      <SimParamsPanel params={params} prevParams={configs.step7} />
      <p>
        In a world of{" "}
        <strong>{intl.format(params.totalPopulation)} people</strong>, how many
        will have been touched by this quiet life?
      </p>
    </div>
  );
}

export function Result({ result, idx }: ResultProps) {
  const totalReached = result.peopleReached;
  const yearsRan = result.years;
  const pct = ((totalReached / result.totalPopulation) * 100).toFixed(1);
  const prev = usePrevSnapshot(idx);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3">
          Cumulative reach over {yearsRan} years
        </h3>
        <MultiResultLineChart
          results={[result, prev.result]}
          labels={["Introvert reach", "Relationships but not bridges"]}
        />
      </div>

      <div className="flex flex-col gap-3 text-gray-700 text-sm leading-relaxed bg-emerald-50 border-l-4 border-primary px-4 py-4 rounded">
        <p>
          <strong>{intl.format(totalReached)} people</strong> — {pct} % of the
          entire world in this simulation — were reached in {yearsRan} years if
          people consistently influenced half a person a year through just{" "}
          {configs.step8.avgConnections} relationships.
        </p>
        <p>
          Compare that to Step 7 (no bridges, twenty relationships per person):
          it spread at a steady linear pace and never compounded. Here, despite
          slower personal influence and a smaller circle, the 1 % bridge
          connection keeps the growth exponential — slow to ignite, but
          unstoppable once it does.
        </p>
        <p>
          The secret sauce isn't how many people you know. It isn't even how
          persuasive you are. It's whether any of those relationships reach
          across to a part of the world you'd never encounter otherwise. A
          single bridge, held open by years of genuine connection, does more
          than a hundred acquaintances who all know the same people you do.
        </p>
        <p className="font-medium text-gray-800">
          You don't have to be an extrovert. You just have to stay in the game
          long enough — and keep at least one door open to somewhere new.
        </p>
      </div>
    </div>
  );
}
