import { useEffect, useMemo, useState } from "react";
import type { SimResult } from "../../types";

interface Props {
  result: SimResult;
  /**
   * One hex colour per wave: index 0 = origin node (year 0),
   * index 1 = reached in year 1, index 2 = year 2, etc.
   */
  yearColors: string[];
  defaultAnimate?: boolean;
  defaultYear?: number;
}

// ─── layout constants (SVG user-units, scaled by viewBox) ───
const SIZE = 480;
const CX = SIZE / 2;
const CY = SIZE / 2;
const RIM_R = 195; // radius of the node ring
const NODE_R = 12; // default node dot radius
const ORIGIN_R = 14; // larger dot for the start node
const UNREACHED_COLOR = "#d1d5db"; // tailwind gray-300

// -- animation timing constants --
const TIME_PER_YEAR = 2000;
const UPDATES_PE_YEAR = 30;

function nodeAngle(id: number, total: number): number {
  // Start from the top (−π/2) and go clockwise
  return (id / total) * 2 * Math.PI - Math.PI / 2;
}

function nodeXY(id: number, total: number): [number, number] {
  const a = nodeAngle(id, total);
  return [CX + RIM_R * Math.cos(a), CY + RIM_R * Math.sin(a)];
}

// ─── component ────────────────────────────────────────────────
export function RimGraph({
  result,
  yearColors,
  defaultAnimate,
  defaultYear,
}: Props) {
  const { totalPopulation, startId, yearlyState, years } = result;

  // Which year to reveal up to, controlled by the slider
  // 0 means "start state with only the origin revealed"
  // 1 means "reveal origin + all Year 1 nodes"
  const [revealUpTo, setRevealUpTo] = useState(defaultYear ?? 0);
  const maxYear = years; // total years the sim ran
  const [isPlaying, setIsPlaying] = useState(defaultAnimate ?? true);

  // Auto-advance the slider, wrapping back to year 1
  // 30 updates per second, each second moves at total of 1 year
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setRevealUpTo((prev) => {
        // floor prev so we still see the last year for a full second before jumping back to 0
        const next =
          Math.floor(prev) > maxYear ? 0 : prev + 1 / UPDATES_PE_YEAR;
        return next === maxYear ? 0 : next;
      });
    }, TIME_PER_YEAR / UPDATES_PE_YEAR);
    return () => clearInterval(id);
  }, [isPlaying, maxYear]);

  // Pause on window blur, resume on window focus
  useEffect(() => {
    let beforeBlur = defaultAnimate ?? true;
    const onBlur = () =>
      setIsPlaying((p) => {
        beforeBlur = p;
        return false;
      });
    const onFocus = () => setIsPlaying(beforeBlur);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [defaultAnimate]);

  const displayYears = Math.floor(revealUpTo);

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

  function togglePlay() {
    setIsPlaying((p) => !p);
  }

  return (
    <div className="flex flex-col gap-3" onClick={togglePlay}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ width: "100%", height: "auto" }}
        aria-label="Influence network — nodes arranged around a circle"
      >
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
              strokeWidth={NODE_R / 2}
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

      {/* Year selector */}
      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Year 1</span>
          <button
            className="flex items-center gap-1 font-medium text-gray-700 cursor-pointer select-none"
            title={isPlaying ? "Pause" : "Play"}
          >
            <span>{isPlaying ? "⏸" : "▶"}</span>
            <span>{`Year ${displayYears}`}</span>
          </button>
          <span>Year {maxYear}</span>
        </div>
        <input
          type="range"
          step={0.1} // for smoother dragging
          min={0}
          max={maxYear}
          value={revealUpTo}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setRevealUpTo(v > maxYear ? 0 : v);
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
