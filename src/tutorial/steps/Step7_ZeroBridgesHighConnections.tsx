import type { PromptProps, ResultProps } from "../types";
import SimParamsPanel from "../visualizers/SimParamsPanel";
import MultiResultLineChart from "../visualizers/MultiResultLineChart";
import { usePrevSnapshot } from "../TutorialContext";
import * as configs from "./configs";
import { useMemo } from "react";

export function Prompt({ params }: PromptProps) {
  const { avgConnections } = params;

  return (
    <div className="flex flex-col gap-4 text-gray-700 leading-relaxed">
      <h2 className="text-xl font-bold text-gray-900">
        Step 7: What if there are no bridges at all?
      </h2>
      <p>
        We've now seen that bridges — those rare connections that skip across
        the network to somewhere completely new — seem to be the secret
        ingredient. But maybe that's because in the previous steps, each person
        didn't know very many people.
      </p>
      <p>
        Let's put that to the test. We'll bring connections per person back up
        to <strong>{avgConnections}</strong> — the large, well-connected network
        from Step 5 — but this time we remove every single long-range bridge.
        Every connection stays local. No shortcuts.
      </p>
      <p>
        The idea will still ripple outward through your circle, and through
        their circles, and so on. Will a large, densely connected local network
        be enough to carry it everywhere?
      </p>

      <SimParamsPanel params={params} prevParams={configs.step6} />
    </div>
  );
}

const prevPrevResultsLabel = `Bridges and many relationships`;
const prevResultsLabel = `Bridges but few relationships`;
const thisResultsLabel = `No bridges but many relationships`;

export function Result({ result, idx }: ResultProps) {
  const prevSnap = usePrevSnapshot(idx);
  const prevPrevSnap = usePrevSnapshot(idx - 1);

  const { cumulativeCrossYear, derivativeCrossYear } = useMemo(() => {
    const a = prevSnap.result.yearlyState.map((s) => s?.influenced ?? 0);
    const b = result.yearlyState.map((s) => s?.influenced ?? 0);
    const len = Math.min(a.length, b.length);

    // cumulative crossover: first year where 'a' (with bridges) exceeds 'b'
    let cumulativeCrossYear: number | null = null;
    for (let i = 0; i < len; i++) {
      if (a[i] > b[i]) {
        cumulativeCrossYear = i + 1;
        break;
      }
    }

    // derivative arrays: new people reached each year
    const derivA: number[] = [];
    const derivB: number[] = [];
    for (let i = 0; i < len; i++) {
      const prevA = i === 0 ? 0 : a[i - 1];
      const prevB = i === 0 ? 0 : b[i - 1];
      derivA.push(a[i] - prevA);
      derivB.push(b[i] - prevB);
    }

    // derivative crossover: first year where derivA > derivB
    let derivativeCrossYear: number | null = null;
    for (let i = 0; i < derivA.length; i++) {
      if (derivA[i] > derivB[i]) {
        derivativeCrossYear = i + 1;
        break;
      }
    }

    return { cumulativeCrossYear, derivativeCrossYear };
  }, [prevSnap, result]);

  const intl = new Intl.NumberFormat([]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3">
          Total reach over time
        </h3>
        <MultiResultLineChart
          results={[prevPrevSnap.result, prevSnap.result, result]}
          labels={[prevPrevResultsLabel, prevResultsLabel, thisResultsLabel]}
        />
      </div>

      <div className="flex flex-col gap-3 text-gray-700 text-sm leading-relaxed bg-emerald-50 border-l-4 border-primary px-4 py-4 rounded">
        <p>
          Without bridges, the idea still reaches{" "}
          <strong>{intl.format(result.peopleReached)} people</strong> in{" "}
          {result.years} years — and it never stalls. The wave keeps spreading
          at a steady, constant pace the entire time. That's the key word:{" "}
          <em>constant</em>. Each year it adds roughly the same number of people
          as the year before, because the wave can only touch the people at its
          edge, and that edge grows at a fixed rate.
        </p>
        <p>
          Compare that to "bridges but few relationships" (from the previous
          step). It starts far below — crawling at first — but its yearly reach
          keeps <em>growing</em>, not staying flat. That's exponential growth.
          It eventually overtakes the no-bridges rate{" "}
          {derivativeCrossYear
            ? `around year ${derivativeCrossYear}`
            : "within the run"}
          , and then roughly{" "}
          {cumulativeCrossYear && derivativeCrossYear
            ? `${cumulativeCrossYear - derivativeCrossYear} years`
            : "many years"}{" "}
          after that, its total reach catches up too
          {cumulativeCrossYear ? ` (around year ${cumulativeCrossYear})` : ""}.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-3">
          New people reached each year
        </h3>
        <MultiResultLineChart
          results={[prevPrevSnap.result, prevSnap.result, result]}
          labels={[prevPrevResultsLabel, prevResultsLabel, thisResultsLabel]}
          showGrowth
          defaultEnabled={[false, true, true]}
        />
      </div>

      <div className="flex flex-col gap-3 text-gray-700 text-sm leading-relaxed bg-emerald-50 border-l-4 border-primary px-4 py-4 rounded">
        <p>
          This year-by-year growth chart shows this most clearly. The no-bridges
          line is nearly flat — a constant number of new people per year, year
          after year. The bridges-but-few-connections line starts below it but
          keeps rising. That rising line is what exponential growth looks like
          from the inside: not a sudden explosion, just a rate that keeps
          increasing.
        </p>
        <p>
          The lesson: having many local connections makes your idea travel
          faster locally, but the wave still expands at a walking pace. A
          network with even a few bridges — even if each person knows far fewer
          people — will eventually lap it. Bridges don't just speed things up;
          they change the fundamental shape of how growth works.
        </p>
      </div>
    </div>
  );
}
