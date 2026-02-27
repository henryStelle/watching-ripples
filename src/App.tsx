import { useEffect, useRef, useState } from "react";
import type { SimParams, SimResult, Status } from "./types";
import { Introduction } from "./components/Introduction";
import { SimulationForm } from "./components/SimulationForm";
import { ResultsPanel } from "./components/ResultsPanel";
import type { WorkerOutMessage } from "./simulation.worker";
import MyWorker from "./simulation.worker?worker";

export default function App() {
  const workerRef = useRef<Worker | null>(null);
  const paramsRef = useRef<SimParams | null>(null);

  // Form state
  const [influence, setInfluence] = useState("");
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
    paramsRef.current = params;
    setSimParams(params);
    setStatus("loading");
    setLoadingProgress(0);
    setLoadingMsg("Running simulation...");
    setResult(null);

    workerRef.current?.postMessage({
      type: "run",
      influencePerYear: n,
      params,
    });

    // Wait for the UI to render
    setTimeout(() => {
      // Remove focus from the form as the scrolling can cause input fields to shift
      const el = document.getElementById("results");

      if (el) {
        console.log("Scrolling to results...", el);
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.focus({ preventScroll: true });
      }
    }, 0);
  }

  const showResults = status === "loading" || status === "done";
  // Use the params that were current when Run was clicked, or live params for the story preview
  const storyParams = simParams ?? buildParams();

  useEffect(() => {
    const worker = new MyWorker();
    workerRef.current = worker;

    const handleProgress = (year: number, reached: number) => {
      const params = paramsRef.current;
      if (!params) return;
      const graphProgress = reached / params.totalPopulation;
      const yearProgress = year / params.maxYears;
      setLoadingProgress(Math.max(yearProgress, graphProgress) * 100);
      setLoadingMsg(`Year ${year}: ${reached.toLocaleString()} people...`);
    };

    worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
      const msg = event.data;
      if (msg.type === "progress") {
        handleProgress(msg.year, msg.reached);
      } else if (msg.type === "result") {
        setResult(msg.result);
        setStatus("done");
      } else if (msg.type === "error") {
        console.error("Simulation error:", msg.message);
        alert("An error occurred during the simulation. Please try again.");
        setStatus("idle");
      }
    };

    worker.onerror = (err) => {
      console.error("Worker error:", err);
      alert("An error occurred during the simulation. Please try again.");
      setStatus("idle");
    };
    return () => {
      worker.terminate();
    };
  }, []);

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-4xl mx-auto md:my-5 md:rounded-xl shadow-2xl overflow-hidden">
        <header className="bg-primary text-white py-10 px-8 text-center">
          <h1 className="text-5xl font-semibold mb-2 drop-shadow-lg">
            Watching Ripples
          </h1>
          <p className="text-xl opacity-95">
            Explore how influence spreads through social networks
          </p>
        </header>

        <div className="p-4 sm:p-8 md:p-10">
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

        <footer className="bg-gray-100 border-t border-gray-200 py-4 px-8 text-center text-sm text-gray-500">
          Inspired by conversations at{" "}
          <a
            href="https://www.windstonecommunity.org"
            target="_blank"
            className="text-primary underline hover:opacity-80"
          >
            Windstone Farm
          </a>
          , a community cultivating Theology, Ecology, &amp; the Arts.
        </footer>
      </div>
    </div>
  );
}
