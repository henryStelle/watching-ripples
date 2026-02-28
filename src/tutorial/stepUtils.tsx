/**
 * Shared utilities for tutorial step files.
 *
 * Keep presentation primitives here so individual steps stay focused on their
 * unique narrative content rather than duplicating visual helpers.
 */

// ── Year-ring color palette ────────────────────────────────────────────────
// Index 0 = root node (the player), index 1 = year 1 ring, etc.
// Chosen to be visually distinct against the dark canvas background and from
// each other so at a glance every ring reads as a different cohort.
export const YEAR_COLORS = [
  "#f59e0b", // year 0 — amber   (you, the origin)
  "#10b981", // year 1 — emerald (first wave)
  "#38bdf8", // year 2 — sky     (second wave)
  "#a78bfa", // year 3 — violet  (third wave)
  "#f87171", // year 4 — rose    (fourth wave)
];

// ── Swatch ─────────────────────────────────────────────────────────────────
// Inline colored dot + bold label used inside result-explanation prose to
// tie written descriptions to specific nodes in the force-graph visualization.
export function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block w-3 h-3 rounded-full shrink-0"
        style={{ background: color }}
      />
      <strong>{label}</strong>
    </span>
  );
}
