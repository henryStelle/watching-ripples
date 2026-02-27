/**
 * AppV2 — Guided Tutorial mode
 *
 * To activate this instead of the default app, change the import in main.tsx:
 *   – import App from "./App"       ← original open-ended tool
 *   + import App from "./AppV2"     ← guided tutorial
 */

import { useEffect, useRef, useState } from "react";
import type { SimParams, SimResult, Status } from "./types";
import type { WorkerOutMessage } from "./simulation.worker";
import MyWorker from "./simulation.worker?worker";

import { TutorialShell } from "./tutorial/TutorialShell";
import { TUTORIAL_STEPS } from "./tutorial/steps/index";
import { TutorialProvider, useStepSnapshots } from "./tutorial/TutorialContext";

export default function AppV2() {
  return (
    <TutorialProvider>
      <AppV2Inner />
    </TutorialProvider>
  );
}

function AppV2Inner() {
  // ── Worker ref ────────────────────────────────────────────────────────────
  const workerRef = useRef<Worker | null>(null);
  const paramsRef = useRef<SimParams | null>(null);

  // ── Sim state ─────────────────────────────────────────────────────────────
  const [simStatus, setSimStatus] = useState<Status>("idle");
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("Running simulation...");
  const [loadingProgress, setLoadingProgress] = useState(0);

  // ── Tutorial navigation ───────────────────────────────────────────────────
  const [stepIndex, setStepIndex] = useState(0);
  const { snapshots } = useStepSnapshots();

  function handleAdvance() {
    setStepIndex((i) => Math.min(i + 1, TUTORIAL_STEPS.length - 1));
  }

  function handleBack() {
    const prevIndex = Math.max(stepIndex - 1, 0);
    const snap = snapshots[prevIndex];
    if (snap) {
      setSimResult(snap.result);
      setSimStatus("done");
    } else {
      resetSim();
    }
    setStepIndex(prevIndex);
  }

  // ── Sim controls ──────────────────────────────────────────────────────────
  function runSim(params: SimParams) {
    paramsRef.current = params;
    setSimStatus("loading");
    setSimResult(null);
    setLoadingProgress(0);
    setLoadingMsg("Running simulation...");
    workerRef.current?.postMessage({ type: "run", params });
  }

  function resetSim() {
    setSimStatus("idle");
    setSimResult(null);
    setLoadingProgress(0);
    setLoadingMsg("Running simulation...");
  }

  // ── Worker lifecycle ──────────────────────────────────────────────────────
  useEffect(() => {
    const worker = new MyWorker();
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
      const msg = event.data;
      if (msg.type === "progress") {
        const params = paramsRef.current;
        if (!params) return;
        const graphProgress = msg.reached / params.totalPopulation;
        const yearProgress = msg.year / params.maxYears;
        setLoadingProgress(Math.max(yearProgress, graphProgress) * 100);
        setLoadingMsg(
          `Year ${msg.year}: ${msg.reached.toLocaleString()} people...`,
        );
      } else if (msg.type === "result") {
        setSimResult(msg.result);
        console.log("Simulation result:", msg.result);
        setSimStatus("done");
      } else if (msg.type === "error") {
        console.error("Simulation error:", msg.message);
        setSimStatus("idle");
      }
    };

    worker.onerror = (err) => {
      console.error("Worker error:", err);
      setSimStatus("idle");
    };

    return () => worker.terminate();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-2xl mx-auto md:my-5 md:rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="bg-primary text-white py-8 px-6 text-center">
          <h1 className="text-4xl font-semibold mb-1 drop-shadow-lg">
            Watching Ripples
          </h1>
          <p className="text-base opacity-90">Guided Tutorial</p>
        </header>

        {/* Tutorial body */}
        <div className="p-5 sm:p-8">
          <TutorialShell
            steps={TUTORIAL_STEPS}
            stepIndex={stepIndex}
            onAdvance={handleAdvance}
            onBack={handleBack}
            simStatus={simStatus}
            simResult={simResult}
            loadingMsg={loadingMsg}
            loadingProgress={loadingProgress}
            runSim={runSim}
            resetSim={resetSim}
          />
        </div>

        {/* Footer */}
        <footer className="bg-gray-100 border-t border-gray-200 py-4 px-6 text-center text-xs text-gray-400 flex flex-col gap-1">
          <span>
            Inspired by conversations at{" "}
            <a
              href="https://www.windstonecommunity.org"
              target="_blank"
              className="text-primary underline hover:opacity-80"
            >
              Windstone Farm
            </a>
          </span>
          <a href="/" className="text-gray-400 hover:text-gray-600 underline">
            Switch to open-ended tool
          </a>
        </footer>
      </div>
    </div>
  );
}
