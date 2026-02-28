/**
 * Step 9 — Reflection + personal simulator.
 *
 * A full-override step: no guess/reveal flow — just a reflective summary of
 * everything covered, followed by a customisable simulator so the reader can
 * explore their own parameters.
 */

import { useState } from "react";
import type { OverrideProps } from "../types";
import type { SimParams } from "../../types";
import MultiResultLineChart from "../visualizers/MultiResultLineChart";
import { RimGraph } from "../visualizers/RimGraph";
import { YEAR_COLORS } from "../stepUtils";
import { YearByYearBreakdown } from "../visualizers/YearByYearBreakdown";

// ─────────────────────────────────────────────────────────────────────────────
// Default personal parameters — a realistic, modest scenario
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_INFLUENCE = 1.0; // 1 new person per year
const DEFAULT_CONNECTIONS = 15; // a small but real circle
const DEFAULT_BRIDGE_PCT = 1; // ~1 % of connections bridge outward
const DEFAULT_YEARS = 40; // roughly a working lifetime
const DEFAULT_POPULATION = 1_000_000; // 1 M — manageable on mobile
const MAX_RIM_POPULATION = 100; // rim graph gets unreadable past this point
const MAX_NETWORK_GRAPH_POPULATION = 5_000;

const intl = new Intl.NumberFormat([]);

// ─────────────────────────────────────────────────────────────────────────────
// Insights
// ─────────────────────────────────────────────────────────────────────────────

const insights: { heading: string; body: string }[] = [
  {
    heading: "Your actions matter — more than you can see",
    body: "Every step in this simulation started with a single person: you. The ripple spread not because you were exceptional, but because influence compounds. The network did most of the work — once you gave it something to carry.",
  },
  {
    heading: "Most of the impact will happen far from your view",
    body: "Your local network saturates quickly. After the first few years the new people being reached are complete strangers — people you will never meet, in cities you may never visit. There's no feedback loop for that. You won't get a notification. You won't feel it. The absence of visible results is not the same thing as an absence of results.",
  },
  {
    heading:
      "A meaningful relationship can change entire lives — and their downstream",
    body: "We're told as children that smiling can change someone's day. When you stay and build a real relationship with someone, you're not just brightening an afternoon — you're shaping how they show up for every person in their own circle for years to come. That's not metaphor; it's what the model shows.",
  },
  {
    heading:
      "If it doesn't seem to be working, that might not mean anything yet",
    body: "Exponential growth is invisible at the start. The curve is flat for a long time before it bends upward. If you're planting seeds and seeing nothing, you might be in the flat part. (Or you might actually be getting no results — selling parkas in the Sahara will probably never go exponential). But the fact that you can't see results right now is not evidence that nothing is happening.",
  },
  {
    heading: "Diversity of connection is the multiplier",
    body: "The simulations showed over and over that the bridge rate — not the size of your circle — is what separates local saturation from global reach. You don't need to fly to another continent to meet someone whose world doesn't overlap with yours. They're at the coffee shop. They're in the checkout line. The bridge is just a real conversation with someone whose life looks different from yours.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Slider helpers
// ─────────────────────────────────────────────────────────────────────────────

// Number of discrete steps used internally for the log-scale slider track.
const LOG_STEPS = 1000;

function logToLinear(value: number, min: number, max: number): number {
  return (Math.log(value / min) / Math.log(max / min)) * LOG_STEPS;
}

function linearToLog(pos: number, min: number, max: number): number {
  return Math.round(min * Math.pow(max / min, pos / LOG_STEPS));
}

interface Scaler {
  toLinear: (value: number) => number;
  fromLinear: (pos: number) => number;
  min: number;
  max: number;
  step: number;
}

const logScaler = (min: number, max: number): Scaler => ({
  toLinear: (value: number) => logToLinear(value, min, max),
  fromLinear: (pos: number) => linearToLog(pos, min, max),
  min: 0,
  max: LOG_STEPS,
  step: 1,
});

// For when you need zero to be a valid value
const sqrtScaler = (min: number, max: number, steps: number): Scaler => ({
  toLinear: (value: number) => Math.sqrt((value - min) / (max - min)) * steps,
  fromLinear: (pos: number) => min + Math.pow(pos / steps, 2) * (max - min),
  min: 0,
  max: steps,
  step: 1,
});

type SliderProps = {
  label: string;
  hint?: string;
  value: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
} & (
  | {
      min: number;
      max: number;
      step: number;
      scaler?: never;
    }
  | {
      min?: never;
      max?: never;
      step?: never;
      scaler: Scaler;
    }
);

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step,
  scaler,
  format,
  onChange,
}: SliderProps) {
  const display = format ? format(value) : String(value);

  // For log sliders the <input> operates on a [0, LOG_STEPS] linear track.
  const inputMin = scaler ? scaler.min : min;
  const inputMax = scaler ? scaler.max : max;
  const inputStep = scaler ? scaler.step : step;
  const inputValue = scaler ? scaler.toLinear(value) : value;

  function handleChange(raw: number) {
    onChange(scaler ? scaler.fromLinear(raw) : raw);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-primary tabular-nums">
          {display}
        </span>
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      <input
        type="range"
        min={inputMin}
        max={inputMax}
        step={inputStep}
        value={inputValue}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reflection component
// ─────────────────────────────────────────────────────────────────────────────

const populationScaler = logScaler(2, 10_000_000);
const bridgePctScaler = sqrtScaler(0, 20, 40);
const { format: formatBridgePct } = Intl.NumberFormat([], {
  maximumSignificantDigits: 2,
});

export function Reflection({
  onBack,
  runSim,
  resetSim,
  simStatus,
  simResult,
}: OverrideProps) {
  const [influencePerYear, setInfluencePerYear] = useState(DEFAULT_INFLUENCE);
  const [avgConnections, setAvgConnections] = useState(DEFAULT_CONNECTIONS);
  const [bridgePct, setBridgePct] = useState(DEFAULT_BRIDGE_PCT);
  const [maxYears, setMaxYears] = useState(DEFAULT_YEARS);
  const [population, setPopulation] = useState(DEFAULT_POPULATION);

  function handleRun() {
    const params: SimParams = {
      influencePerYear,
      totalPopulation: population,
      avgConnections,
      withinRatio: Math.max(0, 1 - bridgePct / 100),
      maxYears,
      trackAncestors:
        population <=
        Math.max(MAX_NETWORK_GRAPH_POPULATION, MAX_RIM_POPULATION), // only track ancestors for smaller populations to save memory
      seed: 42,
    };
    runSim(params);
  }

  function handleReset() {
    resetSim();
    setAvgConnections(DEFAULT_CONNECTIONS);
    setInfluencePerYear(DEFAULT_INFLUENCE);
    setBridgePct(DEFAULT_BRIDGE_PCT);
    setMaxYears(DEFAULT_YEARS);
    setPopulation(DEFAULT_POPULATION);
  }

  const reached = simResult?.peopleReached ?? 0;
  const pct = simResult
    ? (simResult.populationIncluded * 100).toFixed(1)
    : null;

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto px-1">
      {/* ── Heading ── */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What we've learned
        </h2>
        <p className="text-gray-500 text-sm italic">
          A few things worth carrying with you after this simulation.
        </p>
      </div>

      {/* ── Insights ── */}
      <div className="flex flex-col gap-5">
        {insights.map((insight, i) => (
          <div key={i} className="flex gap-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold mt-0.5">
              {i + 1}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{insight.heading}</p>
              <p className="text-gray-600 text-sm leading-relaxed mt-1">
                {insight.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-gray-200" />

      {/* ── Custom simulator ── */}
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Explore the model</h3>
          <p className="text-gray-600 text-sm mt-1 leading-relaxed">
            These sliders set the{" "}
            <strong>average behaviour of every person</strong> in the simulated
            world — not just a single individual. Dial them in to match a
            scenario you find interesting and see how far the ripple travels.
          </p>
        </div>

        <div className="flex flex-col gap-5 bg-gray-50 border border-gray-200 rounded-xl px-5 py-5">
          <Slider
            label="New people each person influences per year (avg)"
            hint="Even 0.5 — one person every two years — compounds into something large."
            value={influencePerYear}
            min={0.1}
            max={5}
            step={0.1}
            format={(v) => (v === 1 ? "1 person / yr" : `${v} people / yr`)}
            onChange={setInfluencePerYear}
          />
          <Slider
            label="Close relationships per person (avg)"
            hint="Meaningful connections, not acquaintances — people they spend real time with."
            value={avgConnections}
            min={2}
            max={50}
            step={1}
            format={(v) => `${v} ${v === 1 ? "person" : "people"}`}
            onChange={setAvgConnections}
          />
          <Slider
            label="% of connections that bridge to a different community (avg)"
            hint="The fraction of each person's circle that comes from a genuinely different part of society."
            value={bridgePct}
            // min={0}
            // max={20}
            // step={0.001}
            scaler={bridgePctScaler}
            format={(v) =>
              v === 0
                ? "none (fully local)"
                : `${formatBridgePct(v)} % of connections`
            }
            onChange={setBridgePct}
          />
          <Slider
            label="Years to run"
            value={maxYears}
            min={5}
            max={80}
            step={5}
            format={(v) => `${v} years`}
            onChange={setMaxYears}
          />
          <Slider
            label="Simulated population"
            hint="Larger worlds take longer to compute — 1 M is a good default on mobile."
            value={population}
            scaler={populationScaler}
            format={(v) => intl.format(v) + " people"}
            onChange={setPopulation}
          />

          <button
            onClick={handleRun}
            disabled={simStatus === "loading"}
            className="w-full bg-primary text-white py-3 px-6 text-base rounded-lg font-bold cursor-pointer transition-all hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {simStatus === "loading" ? "Running…" : "Run the simulation →"}
          </button>
        </div>

        {/* ── Result ── */}
        {simStatus === "done" && simResult && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  People reached
                </p>
                <p className="text-2xl font-bold text-primary">
                  {intl.format(reached)}
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Of the world
                </p>
                <p className="text-2xl font-bold text-primary">{pct} %</p>
              </div>
            </div>

            {(simResult.endReason === "everyone_reached" ||
              simResult.endReason === "network_saturation") && (
              <p className="text-sm text-gray-600 italic text-center">
                The simulation ended early — influence had saturated the
                reachable network.
              </p>
            )}

            <MultiResultLineChart results={[simResult]} />

            <p className="text-sm text-gray-600 text-center">
              This chart shows how the total number of people reached grows over
              time.
            </p>

            {simResult.totalPopulation <= MAX_RIM_POPULATION ? (
              <>
                <RimGraph result={simResult} yearColors={YEAR_COLORS} />
                <p className="text-sm text-gray-600 italic text-center">
                  The rim graph shows how the influence spread over time, works
                  well when the "Relationships / Person" is lower.
                </p>
              </>
            ) : (
              <p className="border border-gray-500 p-4 rounded-2xl text-sm text-gray-500 italic text-center">
                The rim graph visualization is only available for simulations
                with up to {MAX_RIM_POPULATION} people to keep it readable.
              </p>
            )}

            {simResult.peopleReached <= MAX_NETWORK_GRAPH_POPULATION ? (
              <>
                <YearByYearBreakdown
                  result={simResult}
                  yearColors={YEAR_COLORS}
                  interactive
                />
                <p className="text-sm text-gray-600 italic text-center">
                  This interactive graph shows how the ripple spread year by
                  year. Hover over nodes to see details, and use your mouse or
                  fingers to zoom and pan around the network.
                </p>
              </>
            ) : (
              <p className="border border-gray-500 p-4 rounded-2xl text-sm text-gray-500 italic text-center">
                The year-by-year breakdown is only available for simulations
                with up to {MAX_NETWORK_GRAPH_POPULATION} people to keep it
                readable.
              </p>
            )}

            <button
              onClick={handleReset}
              className="text-sm text-primary underline text-center cursor-pointer"
            >
              Reset and try different values
            </button>
          </div>
        )}
      </div>

      {/* ── Back button ── */}
      <button
        onClick={onBack}
        className="text-sm text-gray-400 underline text-left cursor-pointer"
      >
        ← Back to previous step
      </button>
    </div>
  );
}
