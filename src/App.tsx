import { useState } from "react";
import type { SimParams, SimResult, Status } from "./types";
import { runSimulate, sleep } from "./simulation";
import { Introduction } from "./components/Introduction";
import { SimulationForm } from "./components/SimulationForm";
import { ResultsPanel } from "./components/ResultsPanel";

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
        <header className="bg-primary text-white py-10 px-8 text-center">
          <h1 className="text-5xl font-bold mb-2 drop-shadow-lg">
            Windstone Farm
          </h1>
          <p className="text-2xl italic opacity-95">
            Cultivating community through Theology, Ecology, &amp; the Arts
          </p>
        </header>

        <div className="p-8 md:p-10">
          <Introduction />

          <SimulationForm
            influence={influence}
            onInfluenceChange={setInfluence}
            population={population}
            onPopulationChange={setPopulation}
            connections={connections}
            onConnectionsChange={setConnections}
            ratio={ratio}
            onRatioChange={setRatio}
            maxYears={maxYears}
            onMaxYearsChange={setMaxYears}
            status={status}
            onSubmit={handleRun}
          />

          {showResults && (
            <ResultsPanel
              status={status}
              loadingMsg={loadingMsg}
              loadingProgress={loadingProgress}
              result={result}
              storyParams={storyParams}
            />
          )}
        </div>
      </div>
    </div>
  );
}
