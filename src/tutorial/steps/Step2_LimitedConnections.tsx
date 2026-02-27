/**
 * Step 2 — Same influence rate, but only 2 close relationships each
 *
 * Everything is identical to Step 1 except avgConnections is capped at 2.
 * The question teases out the difference between *how fast you can spread*
 * and *how many people are even reachable from you*.
 *
 * Expected outcome: year 1 is the same (you reach 2 people), but in year 2
 * each of those people only has 1 free connection left — you already occupy
 * the other one.  So instead of 6 new in year 2, only 2 new.  Total = 4.
 */

import type { SimParams } from "../../types";
import type { GuessInputConfig, ResultProps } from "../types";
import { YearByYearBreakdown } from "../visualizers/YearByYearBreakdown";
import { YEAR_COLORS, Swatch } from "../stepUtils";

// ── Sim constants ──────────────────────────────────────────────────────────

export const INFLUENCE_PER_YEAR = 2;

const MAX_YEARS = 2;

// Each person has exactly 2 close relationships and nothing beyond them.
// withinRatio: 1 eliminates all long-range bridges so the network is a
// simple ring — every person knows only their two immediate neighbours.
export const TUTORIAL_PARAMS: SimParams = {
  totalPopulation: 10_000,
  avgConnections: 2,
  withinRatio: 1,
  maxYears: MAX_YEARS,
  trackAncestors: true,
};

// ── Prompt ─────────────────────────────────────────────────────────────────

export function Prompt() {
  return (
    <div className="flex flex-col gap-4 text-gray-700 leading-relaxed">
      <h2 className="text-xl font-bold text-gray-900">
        Step 2: What happens when relationships run out?
      </h2>
      <p>
        In the last step, you influenced{" "}
        <strong className="text-primary">2 people in Year 1</strong> and the
        idea kept compounding from there. But that assumed you had a deep pool
        of potential connections to draw upon.
      </p>
      <p>
        Now let's constrain that. Imagine{" "}
        <strong>
          everyone in this simulation — including you — has exactly 2 close
          relationships
        </strong>{" "}
        where genuine influence can flow. That's it. No acquaintances, no
        extended network, just 2 people.
      </p>
      <p>
        Everything else is identical to Step 1:{" "}
        <strong className="text-primary">2 people per year</strong>,{" "}
        <strong>{MAX_YEARS} years</strong>, and each person you reach goes on to
        spread the idea at the same rate.
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
  label:
    "How many people will be influenced after 2 years with only 2 relationships each?",
  placeholder: "Enter your guess",
  min: 0,
  step: 1,
};

// ── Result ─────────────────────────────────────────────────────────────────

export function Result({ result }: ResultProps) {
  const year1Cumulative = result.yearlyState[0]?.influenced ?? 0;
  const year2Cumulative = result.yearlyState[1]?.influenced ?? 0;
  const newInYear2 = year2Cumulative - year1Cumulative;

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
          Year 1 looks the same: the{" "}
          <Swatch color={YEAR_COLORS[0]} label="amber node" /> (you) still
          reaches {year1Cumulative}{" "}
          {year1Cumulative === 1 ? "person" : "people"} — the{" "}
          <Swatch color={YEAR_COLORS[1]} label="emerald nodes" /> in the first
          ring. But you've now <em>used up all your connection slots</em>. You
          have no one left to spread the idea to in Year 2.
        </p>
        <p>
          In Year 2, the {year1Cumulative}{" "}
          {year1Cumulative === 1 ? "person" : "people"} from year 1 each try to
          spread to their {INFLUENCE_PER_YEAR} connections — but one of those
          slots is already occupied by <em>you</em>, the person who influenced
          them. That leaves only <strong>1 free connection each</strong>, so
          together they add just {newInYear2} new{" "}
          {newInYear2 === 1 ? "person" : "people"} — the{" "}
          <Swatch color={YEAR_COLORS[2]} label="sky-blue nodes" /> in the outer
          ring.
        </p>
        <p>
          Limiting each person to {INFLUENCE_PER_YEAR} relationships doesn't
          stop the idea from spreading, but it does reduce how fast it can
          spread.
        </p>
      </div>
    </div>
  );
}
