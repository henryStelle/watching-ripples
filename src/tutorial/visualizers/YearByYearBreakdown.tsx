import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import type { SimResult } from "../../types";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

interface GraphNode {
  id: number;
  year: number;
  // Pre-initialised positions fed to d3-force so it starts from a sensible
  // radial layout rather than a random scatter.
  x?: number;
  y?: number;
}

interface GraphLink {
  source: number;
  target: number;
}

/**
 * Compute initial (x, y) positions for every node using
 * arc-division algorithm.  The root sits at the origin
 * (0, 0) which is the centre of the force-graph canvas; each depth ring is
 * `radiusStep` px away, matching the `dagLevelDistance` prop passed to
 * ForceGraph2D so the physics only needs to make small corrections.
 */
function computeInitialPositions(
  result: SimResult,
  radiusStep: number,
): Map<number, { x: number; y: number }> {
  const { startId, yearlyState } = result;

  const childrenOf = new Map<number, number[]>();
  childrenOf.set(startId, []);

  for (let yi = 0; yi < yearlyState.length; yi++) {
    for (const [src, tgt] of yearlyState[yi].ancestors ?? []) {
      if (!childrenOf.has(src)) childrenOf.set(src, []);
      childrenOf.get(src)!.push(tgt);
      if (!childrenOf.has(tgt)) childrenOf.set(tgt, []);
    }
  }

  // Now calculate the number of descendants for each node
  // So we know their relative importance when dividing up the arc among siblings.
  const descendantCount = new Map<number, number>();
  function countDescendants(id: number): number {
    const children = childrenOf.get(id) ?? [];
    const count = children.reduce(
      (s, childId) => s + 1 + countDescendants(childId),
      0,
    );
    descendantCount.set(id, count);
    return count;
  }
  countDescendants(startId);

  const positions = new Map<number, { x: number; y: number }>();

  function place(id: number, depth: number, arcStart: number, arcEnd: number) {
    const angle = (arcStart + arcEnd) / 2;
    const radius = depth * radiusStep;
    positions.set(id, {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    });
    const childIds = childrenOf.get(id) ?? [];
    const arcAvailable = arcEnd - arcStart;
    const descendants = descendantCount.get(id) ?? 0;
    if (descendants === 0 && childIds.length > 0) {
      throw new Error(`Node ${id} has children but no descendants?`);
    }
    let lastSliceEnd = arcStart;
    childIds.forEach((childId) => {
      const childDescendants = descendantCount.get(childId) ?? 0;
      const childArc = (arcAvailable * (1 + childDescendants)) / descendants;
      const childArcStart = lastSliceEnd;
      const childArcEnd = childArcStart + childArc;
      lastSliceEnd = childArcEnd;
      place(childId, depth + 1, childArcStart, childArcEnd);
    });
  }

  place(startId, 0, -Math.PI, Math.PI);
  return positions;
}

interface Props {
  result: SimResult;
  /**
   * One color per ring, index 0 = root (year 0), index 1 = year 1, etc.
   * Callers should supply as many entries as there are years so each ring
   * gets a visually distinct hue.  Falls back to white for out-of-range years.
   */
  yearColors: string[];
  interactive?: boolean; // if true, allow zooming and panning the graph; otherwise it's a static snapshot
}

/**
 * InfluenceNetworkGraph
 *
 * Renders the ancestor tree returned by the simulation as a radial
 * force-directed graph.  The origin node sits at the centre; each
 * concentric ring represents one year of influence spread.
 *
 * Requires trackAncestors: true in the sim params and a SimResult
 * that includes startId and per-year ancestors arrays.
 */
export function YearByYearBreakdown({
  result,
  yearColors,
  interactive,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods>(undefined);
  const [width, setWidth] = useState(0);
  // Start invisible; fade in only after zoomToFit has finished animating.
  const [visible, setVisible] = useState(false);

  // Must match the dagLevelDistance prop below so our pre-computed positions
  // are already at the right scale for the force simulation.
  const DAG_LEVEL_DISTANCE = 40;

  const graphData = useMemo<{ nodes: GraphNode[]; links: GraphLink[] }>(() => {
    const initialPos = computeInitialPositions(result, DAG_LEVEL_DISTANCE);

    const startPos = initialPos.get(result.startId);
    const nodes: GraphNode[] = [{ id: result.startId, year: 0, ...startPos }];
    const links: GraphLink[] = [];

    for (let yi = 0; yi < result.yearlyState.length; yi++) {
      const year = yi + 1;
      for (const [influencer, influenced] of result.yearlyState[yi].ancestors ??
        []) {
        const pos = initialPos.get(influenced);
        nodes.push({ id: influenced, year, ...pos });
        links.push({ source: influencer, target: influenced });
      }
    }

    return { nodes, links };
  }, [result]);

  // Once the force simulation has finished cooling, rotate the layout so
  // its principal axis (direction of maximum spread, via PCA) aligns with
  // the horizontal — matching the wider canvas dimension — then scale +
  // translate so the whole graph fits with 20 px of padding.
  const handleEngineStop = useCallback(() => {
    const ZOOM_DURATION_MS = 0;
    fgRef.current?.zoomToFit(ZOOM_DURATION_MS, 20);
    // Reveal the canvas only after the zoom animation finishes.
    setTimeout(() => setVisible(true), ZOOM_DURATION_MS);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full rounded-lg overflow-hidden">
      <div
        className={`transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        {width > 0 && (
          <ForceGraph2D
            ref={fgRef}
            width={width}
            height={width}
            graphData={graphData}
            // dagMode: lay out the graph as a tree rooted at the start node,
            // radiating outward so each year forms a concentric ring.
            dagMode="radialout"
            // px gap between consecutive year rings
            dagLevelDistance={DAG_LEVEL_DISTANCE}
            backgroundColor="#030712"
            // colour each node by its year ring using the caller-supplied palette
            nodeColor={(n) =>
              yearColors[(n as GraphNode).year % yearColors.length] ?? "#ffffff"
            }
            // base radius of each node in px (scaled by nodeVal if set)
            nodeRelSize={5}
            // tooltip shown on hover
            nodeLabel={(n) => {
              const node = n as GraphNode;
              if (node.id === result.startId)
                return "That's you — where the idea begins.";
              return `Reached in the ${ordinal(node.year)} year`;
            }}
            linkColor={() => "#1f2937"}
            // px width of each directed edge
            linkWidth={1.5}
            // length of the arrowhead in px
            linkDirectionalArrowLength={5}
            // 1 = arrowhead sits at the target node
            linkDirectionalArrowRelPos={1}
            linkDirectionalArrowColor={() => "#374151"}
            // disable all user interaction — this is a read-only diagram
            enableZoomInteraction={interactive ?? false}
            enablePanInteraction={interactive ?? false}
            enableNodeDrag={false}
            // number of physics ticks to run before freezing the layout;
            cooldownTicks={50}
            // after physics settles, auto-fit the whole graph into view
            onEngineStop={handleEngineStop}
          />
        )}
      </div>
    </div>
  );
}
