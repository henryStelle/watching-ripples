import { useEffect, useMemo, useState } from "react";
import type { ResultProps } from "../types";

interface Props extends ResultProps {
  /**
   * One hex colour per wave: index 0 = origin node (year 0),
   * index 1 = reached in year 1, index 2 = year 2, etc.
   */
  yearColors: string[];
}

// ─── layout constants (SVG user-units, scaled by viewBox) ───
const SIZE = 480;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RIM_R = 195; // radius of the node ring
const NODE_R = 7; // default node dot radius
const ORIGIN_R = 10; // larger dot for the start node
const UNREACHED_COLOR = "#d1d5db"; // tailwind gray-300

function nodeAngle(id: number, total: number): number {
  // Start from the top (−π/2) and go clockwise
  return (id / total) * 2 * Math.PI - Math.PI / 2;
}

function nodeXY(id: number, total: number): [number, number] {
  const a = nodeAngle(id, total);
  return [CX + RIM_R * Math.cos(a), CY + RIM_R * Math.sin(a)];
}

// ─── component ────────────────────────────────────────────────
export function RimGraph({ result, yearColors }: Props) {
  const { totalPopulation, startId, yearlyState, years } = result;

  // Which year (1-indexed) to reveal up to; 0 = show all years
  const [revealUpTo, setRevealUpTo] = useState(1);
  const maxYear = years; // total years the sim ran
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-advance the slider every second, wrapping back to year 1
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setRevealUpTo((prev) => {
        const current = prev === 0 ? maxYear : prev;
        const next = current >= maxYear ? 1 : current + 1;
        return next === maxYear ? 0 : next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying, maxYear]);

  // Pause on window blur, resume on window focus
  useEffect(() => {
    const onBlur = () => setIsPlaying(false);
    const onFocus = () => setIsPlaying(true);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const displayYears = revealUpTo === 0 ? maxYear : revealUpTo;

  // nodeId → year it was first reached (0 = origin)
  const yearReached = useMemo(() => {
    const map = new Map<number, number>();
    map.set(startId, 0);
    for (let yi = 0; yi < yearlyState.length; yi++) {
      for (const [, influenced] of yearlyState[yi].ancestors ?? []) {
        map.set(influenced, yi + 1);
      }
    }
    return map;
  }, [startId, yearlyState]);

  // All (influencer → influenced) edges, tagged with the year they happened
  const allEdges = useMemo(() => {
    const list: { src: number; tgt: number; year: number }[] = [];
    for (let yi = 0; yi < yearlyState.length; yi++) {
      for (const [src, tgt] of yearlyState[yi].ancestors ?? []) {
        list.push({ src, tgt, year: yi + 1 });
      }
    }
    return list;
  }, [yearlyState]);

  // Only show edges / reached-state up to displayYears
  const visibleEdges = allEdges.filter((e) => e.year <= displayYears);

  function fillColor(id: number): string {
    const y = yearReached.get(id);
    if (y === undefined || y > displayYears) return UNREACHED_COLOR;
    return yearColors[y] ?? yearColors[yearColors.length - 1];
  }

  const nodes = Array.from({ length: totalPopulation }, (_, id) => id);

  return (
    <div className="flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ width: "100%", height: "auto" }}
        aria-label="Influence network — nodes arranged around a circle"
      >
        {/* faint guide ring */}
        <circle
          cx={CX}
          cy={CY}
          r={RIM_R}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={1}
        />

        {/* chord edges — drawn first so nodes sit on top */}
        {visibleEdges.map(({ src, tgt, year }, i) => {
          const [x1, y1] = nodeXY(src, totalPopulation);
          const [x2, y2] = nodeXY(tgt, totalPopulation);
          const color = yearColors[year] ?? "#6b7280";
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={1.5}
              strokeOpacity={0.4}
            />
          );
        })}

        {/* nodes */}
        {nodes.map((id) => {
          const [x, y] = nodeXY(id, totalPopulation);
          const isOrigin = id === startId;
          const r = isOrigin ? ORIGIN_R : NODE_R;
          return (
            <circle
              key={id}
              cx={x}
              cy={y}
              r={r}
              fill={fillColor(id)}
              stroke={isOrigin ? "#1f2937" : "white"}
              strokeWidth={isOrigin ? 2.5 : 1.5}
            />
          );
        })}
      </svg>

      {/* Year scrubber */}
      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Year 1</span>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="flex items-center gap-1 font-medium text-gray-700 cursor-pointer select-none"
            title={isPlaying ? "Pause" : "Play"}
          >
            <span>{isPlaying ? "⏸" : "▶"}</span>
            <span>
              {revealUpTo === 0 ? `All ${maxYear} years` : `Year ${revealUpTo}`}
            </span>
          </button>
          <span>Year {maxYear}</span>
        </div>
        <input
          type="range"
          min={1}
          max={maxYear}
          value={revealUpTo === 0 ? maxYear : revealUpTo}
          onChange={(e) => {
            const v = Number(e.target.value);
            setRevealUpTo(v === maxYear ? 0 : v);
          }}
          className="w-full accent-emerald-600"
        />
        {/* colour legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
          {Array.from({ length: displayYears + 1 }, (_, y) => (
            <span
              key={y}
              className="flex items-center gap-1 text-xs text-gray-600"
            >
              <span
                className="inline-block rounded-full"
                style={{
                  width: 10,
                  height: 10,
                  background: yearColors[y] ?? UNREACHED_COLOR,
                  border: y === 0 ? "1.5px solid #1f2937" : "1px solid white",
                }}
              />
              {y === 0 ? "You" : `Year ${y}`}
            </span>
          ))}
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: UNREACHED_COLOR, border: "1px solid white" }}
            />
            Not yet reached
          </span>
        </div>
      </div>
    </div>
  );
}
