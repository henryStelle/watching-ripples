import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import type { ResultProps } from "../types";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

interface GraphNode {
  id: number;
  year: number;
}

interface GraphLink {
  source: number;
  target: number;
}

interface Props extends ResultProps {
  /**
   * One color per ring, index 0 = root (year 0), index 1 = year 1, etc.
   * Callers should supply as many entries as there are years so each ring
   * gets a visually distinct hue.  Falls back to white for out-of-range years.
   */
  yearColors: string[];
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
export function YearByYearBreakdown({ result, yearColors }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods>(undefined);
  const [width, setWidth] = useState(400);
  // Start invisible; fade in only after zoomToFit has finished animating.
  const [visible, setVisible] = useState(false);

  const graphData = useMemo<{ nodes: GraphNode[]; links: GraphLink[] }>(() => {
    const nodes: GraphNode[] = [{ id: result.startId, year: 0 }];
    const links: GraphLink[] = [];

    for (let yi = 0; yi < result.yearlyState.length; yi++) {
      const year = yi + 1;
      for (const [influencer, influenced] of result.yearlyState[yi].ancestors ??
        []) {
        nodes.push({ id: influenced, year });
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
    type PosNode = GraphNode & { x?: number; y?: number };
    const nodes = graphData.nodes as PosNode[];
    const positioned = nodes.filter((n) => n.x != null && n.y != null);

    if (positioned.length > 1) {
      // 1. Centroid
      const cx = positioned.reduce((s, n) => s + n.x!, 0) / positioned.length;
      const cy = positioned.reduce((s, n) => s + n.y!, 0) / positioned.length;

      // 2. 2×2 covariance matrix components
      let cxx = 0,
        cxy = 0,
        cyy = 0;
      for (const n of positioned) {
        const dx = n.x! - cx;
        const dy = n.y! - cy;
        cxx += dx * dx;
        cxy += dx * dy;
        cyy += dy * dy;
      }

      // 3. Angle of the first eigenvector (principal axis)
      const angle = 0.5 * Math.atan2(2 * cxy, cxx - cyy);

      // 4. Rotate all nodes so the principal axis lies along x
      const cos = Math.cos(-angle);
      const sin = Math.sin(-angle);
      for (const n of positioned) {
        const dx = n.x! - cx;
        const dy = n.y! - cy;
        n.x = cx + cos * dx - sin * dy;
        n.y = cy + sin * dx + cos * dy;
      }
    }

    const ZOOM_DURATION_MS = 0;
    fgRef.current?.zoomToFit(ZOOM_DURATION_MS, /* padding px */ 20);
    // Reveal the canvas only after the zoom animation finishes.
    setTimeout(() => setVisible(true), ZOOM_DURATION_MS);
  }, [graphData]);

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
    <div
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden bg-gray-950"
    >
      <div
        className={`w-full transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <ForceGraph2D
          ref={fgRef}
          width={width}
          height={320}
          graphData={graphData}
          // dagMode: lay out the graph as a tree rooted at the start node,
          // radiating outward so each year forms a concentric ring.
          dagMode="radialout"
          // px gap between consecutive year rings
          dagLevelDistance={60}
          backgroundColor="#030712"
          // colour each node by its year ring using the caller-supplied palette
          nodeColor={(n) => yearColors[(n as GraphNode).year] ?? "#ffffff"}
          // base radius of each node in px (scaled by nodeVal if set)
          nodeRelSize={5}
          // tooltip shown on hover
          nodeLabel={(n) => {
            const node = n as GraphNode;
            if (node.id === result.startId)
              return "That's you — where the idea begins.";
            return `Someone reached in Year ${ordinal(node.year)} of the simulation.`;
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
          enableZoomInteraction={false}
          enablePanInteraction={false}
          enableNodeDrag={false}
          // number of physics ticks to run before freezing the layout;
          cooldownTicks={50}
          // after physics settles, auto-fit the whole graph into view
          onEngineStop={handleEngineStop}
        />
      </div>
    </div>
  );
}
