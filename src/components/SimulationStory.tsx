import type { SimParams } from "../types";

interface SimulationStoryProps {
  params: SimParams;
}

export function SimulationStory({ params }: SimulationStoryProps) {
  const withinPercent = (params.withinRatio * 100).toFixed(1);
  const betweenNum = Math.round(
    params.avgConnections * (1 - params.withinRatio),
  );

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
        Now imagine you're dropped randomly into this network. Each year, you
        meaningfully influence a few people. Crucially, each person you reach
        becomes a source of influence themselves—not a dead end. This is what
        separates exponential growth from the linear model our intuitions
        default to: the "active" population doesn't stay fixed at you, it grows
        each year.
      </p>
      <p>
        The simulation runs year by year, tracking how the ripple compounds
        through authentic relationships. It stops when one of three things
        happens: everyone has been reached (a complete ripple!), the network
        saturates (all reachable people have already been reached), or{" "}
        {params.maxYears} years pass.
      </p>
    </div>
  );
}
