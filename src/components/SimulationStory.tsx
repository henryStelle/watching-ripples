import type { SimParams } from "../types";

interface SimulationStoryProps {
  params: SimParams;
}

export function SimulationStory({ params }: SimulationStoryProps) {
  const withinPercent = (params.withinRatio * 100).toFixed(1);
  const betweenNum = params.connectionsBetween.toPrecision(1);

  return (
    <div className="flex flex-col gap-3 mt-3">
      <p>
        Picture a world of {params.totalPopulation.toLocaleString()} people
        where each person knows roughly {params.avgConnections} others by
        name—friends, family, coworkers, neighbors. But here's the key insight
        from social science: about {withinPercent}% of those relationships stay
        within their own tight-knit, local community, while only {betweenNum}{" "}
        relationships bridge out to connect with people in other communities.
      </p>
      <p>
        Now imagine you're dropped randomly into this network. You begin by
        genuinely encouraging a few people each year toward environmental
        sensitivity—through shared meals, gardening together, heartfelt
        conversations about stewarding creation. Those you influence? They start
        doing the same, and the ripple spreads outward.
      </p>
      <p>
        The simulation runs year by year, tracking how your influence flows
        through these authentic relationships. It stops when one of three things
        happens: everyone has been reached (a complete ripple!), the ripple hits
        network saturation (when the influenced people have no more
        un-influenced friends to reach), or {params.maxYears} years pass.
      </p>
    </div>
  );
}
