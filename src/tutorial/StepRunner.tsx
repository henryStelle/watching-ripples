import { useEffect, useState } from "react";
import type { SimParams, SimResult, Status } from "../types";
import type { TutorialStepDef } from "./types";

interface StepRunnerProps {
  step: Extract<TutorialStepDef, { fullOverride?: never }>;
  onAdvance: () => void;
  onBack: () => void;
  simStatus: Status;
  simResult: SimResult | null;
  loadingMsg: string;
  loadingProgress: number;
  runSim: (params: SimParams) => void;
  resetSim: () => void;
}

type Phase = "predicting" | "running" | "revealed";

/**
 * StepRunner
 *
 * Owns all state and UI that is common across every standard tutorial step:
 *   • Prompt — the step's explanation / question setup
 *   • Guess input + submit button
 *   • Loading bar
 *   • Guess vs actual reveal cards
 *   • Result — the step's explanation of why the answer is what it is
 *   • Back / Continue nav buttons
 *
 * Step files contribute only: Prompt, guessInput config, and Result.
 */
export function StepRunner({
  step,
  onAdvance,
  onBack,
  simStatus,
  simResult,
  loadingMsg,
  loadingProgress,
  runSim,
  resetSim,
}: StepRunnerProps) {
  const [guess, setGuess] = useState("");
  const [lockedGuess, setLockedGuess] = useState<number | null>(null);

  // Reset sim + local state whenever the step changes (i.e. when stepIndex changes
  // and a new StepRunner is mounted by the shell's `key` prop).
  useEffect(() => {
    resetSim();
    setGuess("");
    setLockedGuess(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phase: Phase =
    lockedGuess === null
      ? "predicting"
      : simStatus === "done"
        ? "revealed"
        : "running";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(guess);
    if (isNaN(parsed) || parsed < 0) return;
    setLockedGuess(parsed);
    runSim(step.simParams);
  }

  const { Prompt, guessInput, Result } = step;
  const actual = simResult?.peopleReached ?? 0;
  const years = simResult?.years ?? 0;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto px-1">
      {/* ── Step's Prompt ─────────────────────────────────────── */}
      <Prompt params={step.simParams} />

      {/* Question display */}
      <div className="bg-amber-50 border-l-4 text-gray-700 border-amber-400 px-4 py-3 rounded text-sm">
        <strong>The question:</strong> {guessInput.label}
      </div>

      {/* ── Predicting — guess form ───────────────────────────── */}
      {phase === "predicting" && (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              id="step-guess"
              type="number"
              required
              min={guessInput.min ?? 0}
              max={guessInput.max}
              step={guessInput.step ?? 1}
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder={guessInput.placeholder ?? "Enter your guess"}
              className="border-2 border-gray-300 focus:border-primary rounded-md px-4 py-3 text-xl text-center font-bold outline-none w-full"
            />
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 px-6 text-base rounded-md font-bold cursor-pointer transition-all hover:shadow-md active:scale-95"
            >
              Lock in my guess &amp; run simulation →
            </button>
          </form>

          <button
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-gray-600 text-center cursor-pointer"
          >
            ← Back
          </button>
        </>
      )}

      {/* ── Running — loading bar ─────────────────────────────── */}
      {phase === "running" && (
        <div className="flex flex-col gap-3 items-center py-6">
          <p className="text-primary font-semibold text-center">{loadingMsg}</p>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Revealed ─────────────────────────────────────────── */}
      {phase === "revealed" && simResult && lockedGuess !== null && (
        <div className="flex flex-col gap-6">
          {/* Guess vs actual cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center justify-center gap-1 bg-gray-100 rounded-lg p-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Your guess
              </span>
              <span className="text-4xl font-bold text-gray-700">
                {lockedGuess}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 bg-primary/10 border-2 border-primary rounded-lg p-4">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                Actual result
              </span>
              <span className="text-4xl font-bold text-primary">{actual}</span>
              <span className="text-xs text-primary/70 italic">
                people influenced in {years} years
              </span>
            </div>
          </div>

          {/* Step's Result — explains why */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <Result result={simResult} params={step.simParams} />
          </div>

          {/* Nav */}
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 border-2 border-gray-300 text-gray-600 py-3 px-4 rounded-lg font-semibold cursor-pointer transition-all hover:border-gray-400 active:scale-95"
            >
              ← Back
            </button>
            <button
              onClick={onAdvance}
              className="flex-3 bg-primary text-white py-3 px-6 rounded-lg font-bold cursor-pointer transition-all hover:shadow-lg active:scale-95"
            >
              Continue →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
