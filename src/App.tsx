import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ============================================================
// SIMULATION TYPES
// ============================================================

interface SimParams {
  totalPopulation: number;
  avgConnections: number;
  withinRatio: number;
  connectionsBetween: number;
  maxYears: number;
}

interface SimResult {
  years: number;
  peopleReached: number;
  percentage: string;
  yearlyGrowth: { people: number }[];
  endReason: "everyone_reached" | "network_saturation" | "max_time";
  totalPopulation: number;
}

// ============================================================
// SIMULATION LOGIC (1:1 from windstone_exponential_impact.html)
// ============================================================

class SocialNetwork {
  totalPopulation: number;
  avgConnections: number;
  withinRatio: number;
  connectionCache: Map<number, number[]>;

  constructor(params: SimParams) {
    this.totalPopulation = params.totalPopulation;
    this.avgConnections = params.avgConnections;
    this.withinRatio = params.withinRatio;
    this.connectionCache = new Map();
  }

  getConnectionCounts() {
    let within = this.avgConnections * this.withinRatio;
    within =
      Math.random() < within % 1 ? Math.ceil(within) : Math.floor(within);
    return { within, between: this.avgConnections - within };
  }

  clearCacheOf(id: number) {
    this.connectionCache.delete(id);
  }

  getConnections(personId: number): number[] {
    if (this.connectionCache.has(personId))
      return this.connectionCache.get(personId)!;

    const connections = new Set<number>();
    const { within, between } = this.getConnectionCounts();
    const half = Math.floor(within / 2);

    for (let offset = -half; offset <= half; offset++) {
      if (offset === 0) continue;
      connections.add(
        (personId + offset + this.totalPopulation) % this.totalPopulation,
      );
    }
    for (let i = 0; i < between; i++) {
      const r = Math.floor(Math.random() * this.totalPopulation);
      if (r !== personId) connections.add(r);
    }
    const result = Array.from(connections);
    this.connectionCache.set(personId, result);
    return result;
  }
}

function makeTimer(duration: number) {
  let start = performance.now();
  return () => {
    const done = performance.now() - start >= duration;
    if (done) start = performance.now();
    return done;
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function runSimulate(
  influencePerYear: number,
  params: SimParams,
  onProgress: (year: number, reached: number) => void,
): Promise<SimResult> {
  const network = new SocialNetwork(params);
  const tick = makeTimer(100);
  const start = Math.floor(Math.random() * params.totalPopulation);
  const influenced = new Set<number>([start]);
  let active = [start];
  let year = 0;
  const growth: { people: number }[] = [];
  let endReason: SimResult["endReason"] = "everyone_reached";

  while (active.length > 0 && influenced.size < params.totalPopulation) {
    year++;
    const next = new Set<number>();
    let exhausted = true;

    for (const influencer of shuffleArray([...active])) {
      if (influenced.size >= params.totalPopulation) break;

      if (tick()) {
        await sleep(0);
        onProgress(year, influenced.size);
      }

      const conns = network.getConnections(influencer);
      let available = conns.filter((c) => !influenced.has(c));
      if (available.length > 0) exhausted = false;

      if (available.length > influencePerYear) {
        available = shuffleArray(available);
        next.add(influencer);
      } else {
        network.clearCacheOf(influencer);
      }

      let toInfluence = Math.min(influencePerYear, available.length);
      if (toInfluence % 1 !== 0) {
        toInfluence =
          Math.random() < influencePerYear % 1
            ? Math.ceil(toInfluence)
            : Math.floor(toInfluence);
      }
      for (let i = 0; i < toInfluence; i++) {
        influenced.add(available[i]);
        next.add(available[i]);
      }
    }

    if (exhausted) {
      endReason = "network_saturation";
      break;
    }
    growth.push({ people: influenced.size - 1 });
    active = Array.from(next);
    if (year >= params.maxYears) {
      endReason = "max_time";
      break;
    }
  }

  return {
    years: growth.length,
    peopleReached: influenced.size - 1,
    percentage: ((influenced.size / params.totalPopulation) * 100).toFixed(2),
    yearlyGrowth: growth,
    endReason,
    totalPopulation: params.totalPopulation,
  };
}

// ============================================================
// APP COMPONENT
// ============================================================

type Status = "idle" | "loading" | "done";

export default function App() {
  // Form state
  const [influence, setInfluence] = useState("3");
  const [population, setPopulation] = useState("1500000");
  const [connections, setConnections] = useState("150");
  const [ratio, setRatio] = useState("0.95");
  const [maxYears, setMaxYears] = useState("10");

  // Simulation state
  const [status, setStatus] = useState<Status>("idle");
  const [loadingMsg, setLoadingMsg] = useState("Running simulation...");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [result, setResult] = useState<SimResult | null>(null);
  const [simParams, setSimParams] = useState<SimParams | null>(null);

  function buildParams(): SimParams {
    const avgConnections = parseInt(connections) || 150;
    const withinRatio = parseFloat(ratio) || 0.95;
    return {
      totalPopulation: parseInt(population) || 1500000,
      avgConnections,
      withinRatio,
      connectionsBetween: avgConnections * (1 - withinRatio),
      maxYears: parseInt(maxYears) || 10,
    };
  }

  async function handleRun() {
    const n = parseFloat(influence);
    if (!n || isNaN(n) || n <= 0) {
      alert(
        "Please enter a positive number of people you can influence per year.",
      );
      return;
    }
    const params = buildParams();
    setSimParams(params);
    setStatus("loading");
    setLoadingProgress(0);
    setLoadingMsg("Running simulation...");
    setResult(null);
    await sleep(0); // let React flush before the heavy loop

    try {
      const res = await runSimulate(n, params, (year, reached) => {
        const graphProgress = reached / params.totalPopulation;
        const yearProgress = year / params.maxYears;
        setLoadingProgress(Math.max(yearProgress, graphProgress) * 100);
        setLoadingMsg(
          `Year ${year}: Reached ${reached.toLocaleString()} people...`,
        );
      });
      setResult(res);
      setStatus("done");
    } catch (err) {
      console.error("Simulation error:", err);
      alert("An error occurred during the simulation. Please try again.");
      setStatus("idle");
    }
  }

  const showResults = status === "loading" || status === "done";
  // Use the params that were current when Run was clicked, or live params for the story preview
  const storyParams = simParams ?? buildParams();

  return (
    <div className="min-h-screen font-cormorant text-lg">
      <div className="max-w-4xl mx-auto md:my-5 md:rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="bg-primary text-white py-10 px-8 text-center">
          <h1 className="text-5xl font-bold mb-2 drop-shadow-lg">
            Windstone Farm
          </h1>
          <p className="text-2xl italic opacity-95">
            Cultivating community through Theology, Ecology, &amp; the Arts
          </p>
        </header>

        <div className="p-8 md:p-10">
          {/* Introduction */}
          <div className="mb-10">
            <h2 className="text-primary text-3xl font-bold mb-4 pb-3 border-b-2 border-primary">
              Can Small Actions Really Make an Impact?
            </h2>
            <p className="mb-4 text-gray-700 text-justify">
              At{" "}
              <a
                href="https://windstonefarm.org"
                target="_blank"
                className="text-primary underline hover:opacity-80"
              >
                Windstone Farm
              </a>
              , we believe in the power of community and individual action. But
              can a small organization—or even you as an individual—truly make a
              difference in addressing environmental challenges?
            </p>
            <p className="mb-4 text-gray-700 text-justify">
              The answer is a resounding <strong>yes</strong>, and the math
              proves it.
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-5 my-5 rounded">
              <strong>The Science of Connection:</strong> Research shows that{" "}
              <a
                href="https://ourworldindata.org/limits-personal-experience"
                target="_blank"
                className="text-primary underline hover:opacity-80"
              >
                the average American knows approximately 611 people by name
              </a>
              . However, anthropologist Robin Dunbar's research indicates that{" "}
              <a
                href="https://www.bbc.com/future/article/20191001-dunbars-number-why-we-can-only-maintain-150-relationships"
                target="_blank"
                className="text-primary underline hover:opacity-80"
              >
                we can only maintain about 150 meaningful relationships
              </a>
              —the kind that go beyond just knowing someone's name.
              Additionally, research from{" "}
              <a
                href="https://www.cl.cam.ac.uk/~cm542/papers/icwsm12full.pdf"
                target="_blank"
                className="text-primary underline hover:opacity-80"
              >
                social network studies shows that about 5% of people act as
                perfect bridges
              </a>{" "}
              between otherwise separate groups. We're all connected within{" "}
              <a
                href="https://en.wikipedia.org/wiki/Six_degrees_of_separation"
                target="_blank"
                className="text-primary underline hover:opacity-80"
              >
                about six degrees of separation
              </a>
              . Through authentic relationships and genuine influence, your
              actions can ripple far beyond what you might imagine.
            </div>
          </div>

          {/* Simulation Form */}
          <div className="mb-10">
            <h2 className="text-primary text-3xl font-bold mb-4 pb-3 border-b-2 border-primary">
              See Your Ripple Effect
            </h2>
            <p className="mb-4 text-gray-700 text-justify">
              It can feel like our individual actions are just a drop in the
              bucket. But what if that drop creates ripples? Imagine you inspire
              just a few people each year to live more sustainably—maybe through
              conversation over a meal, working alongside them in a garden, or
              sharing what you've learned about creation care. What if those
              people, in turn, inspire others?
            </p>
            <p className="mb-4 text-gray-700 text-justify">
              This simulation shows how your "drop in the bucket" can ripple
              through a network, accounting for the reality that about 95% of
              relationships stay within close-knit communities. Watch how your
              influence could spread through authentic relationships.
            </p>

            <form
              className="bg-gray-50 p-8 rounded-lg border-2 border-primary"
              onSubmit={(e) => {
                e.preventDefault();
                handleRun();
              }}
            >
              <div className="mb-5">
                <label
                  htmlFor="influence"
                  className="block font-bold mb-2 text-gray-700"
                >
                  How many people do you think you could meaningfully encourage
                  toward environmental sensitivity each year?
                </label>
                <input
                  type="number"
                  id="influence"
                  min="0"
                  step="0.01"
                  value={influence}
                  onChange={(e) => setInfluence(e.target.value)}
                  placeholder="Enter a number (e.g., 3)"
                  className="w-full p-3 text-lg border-2 border-gray-300 rounded-md focus:outline-none focus:border-primary transition-colors"
                />
                <small className="text-gray-600 block mt-1">
                  Be realistic—quality relationships matter more than quantity
                </small>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-primary text-white py-4 px-10 text-xl rounded-md font-bold cursor-pointer transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Run Ripple Simulation
              </button>

              {/* Advanced Options */}
              <details className="mt-6">
                <summary className="text-primary cursor-pointer">
                  <span className="font-semibold">Advanced Options</span>
                </summary>
                <div className="mt-4 p-4 bg-white rounded border border-gray-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Total Population
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={population}
                        onChange={(e) => setPopulation(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Meaningful Relationships per Person
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={connections}
                        onChange={(e) => setConnections(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Within-Community Ratio
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.0001"
                        value={ratio}
                        onChange={(e) => setRatio(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                      <small className="text-gray-600 block mt-1">
                        5% of relationships act as bridges between groups
                      </small>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Max Simulation Years
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={maxYears}
                        onChange={(e) => setMaxYears(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </details>
            </form>
          </div>

          {/* Results */}
          {showResults && (
            <div className="mt-8 bg-linear-to-br from-green-50 to-emerald-100 p-8 rounded-lg border-2 border-primary flex flex-col gap-4 animate-slide-in">
              <h2 className="text-primary text-3xl font-bold">
                Your Ripple Effect
              </h2>

              {/* Loading */}
              {status === "loading" && (
                <div className="flex flex-col gap-2 items-center justify-center py-5">
                  <p className="text-xl text-primary">{loadingMsg}</p>
                  <div className="w-2/3 bg-gray-300 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-primary h-4 rounded-full"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Results content */}
              {status === "done" && result && (
                <ResultsContent result={result} params={storyParams} />
              )}

              {/* Simulation story — visible as soon as the results panel appears */}
              <div className="bg-white shadow p-5 rounded-md text-gray-600 leading-relaxed">
                <strong className="text-lg text-gray-800">
                  How this simulation works:
                </strong>
                <SimulationStory params={storyParams} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function ResultsContent({
  result,
  params,
}: {
  result: SimResult;
  params: SimParams;
}) {
  const plural = result.years === 1 ? "year" : "years";

  let endReasonText = "";
  let endReasonExplanation = "";
  if (result.endReason === "everyone_reached") {
    endReasonText = "🎉 Everyone Reached!";
    endReasonExplanation =
      "Your influence rippled through the entire network. Every single person was reached!";
  } else if (result.endReason === "network_saturation") {
    endReasonText = "⛓️ Network Saturation";
    endReasonExplanation = `All reachable connections have been influenced. The people you reached have no remaining un-influenced friends to spread to. This happens because communities are tightly connected internally (${(params.withinRatio * 100).toFixed(0)}% of relationships), with only about ${((1 - params.withinRatio) * 100).toFixed(0)}% of people acting as bridges between groups.`;
  } else {
    endReasonText = "⏰ Time Limit Reached";
    endReasonExplanation =
      'The simulation reached its maximum duration. The ripple is still spreading, but we stopped the simulation here. You can try increasing the "Max Simulation Years" in the advanced options to see how much further it could go!';
  }

  const chartData = result.yearlyGrowth.map((d, i) => ({
    year: `Year ${i + 1}`,
    people: d.people,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 bg-white p-5 rounded-lg shadow">
          <div className="text-gray-600 uppercase tracking-wide">
            Simulation Duration
          </div>
          <div className="text-4xl text-primary font-bold">
            {result.years} {plural}
          </div>
        </div>
        <div className="flex-1 bg-white p-5 rounded-lg shadow">
          <div className="text-gray-600 uppercase tracking-wide">
            People Reached
          </div>
          <div className="text-4xl text-primary font-bold">
            {result.peopleReached.toLocaleString()}
          </div>
        </div>
        <div className="flex-1 bg-white p-5 rounded-lg shadow">
          <div className="text-gray-600 uppercase tracking-wide">
            Percentage of Network
          </div>
          <div className="text-4xl text-primary font-bold">
            {result.percentage}%
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg shadow">
        <div className="text-gray-600 uppercase tracking-wide">
          Simulation End Reason
        </div>
        <div className="text-lg text-gray-700 font-semibold">
          <strong>{endReasonText}</strong>
          <br />
          <p className="text-gray-600 font-normal mt-1">
            {endReasonExplanation}
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg shadow">
        <div className="text-gray-600 uppercase tracking-wide mb-3">
          Growth Pattern
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v: number) => v.toLocaleString()}
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip
              formatter={(v: number | undefined) => v?.toLocaleString() ?? ""}
            />
            <Line
              type="monotone"
              dataKey="people"
              stroke="rgb(59, 84, 33)"
              strokeWidth={2}
              dot={false}
              fill="rgba(59, 84, 33, 0.2)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface SimulationStoryProps {
  params: SimParams;
}

function SimulationStory({ params }: SimulationStoryProps) {
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
