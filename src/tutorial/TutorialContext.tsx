import { createContext, useContext, useState, type ReactNode } from "react";
import type { SimResult } from "../types";

export interface StepSnapshot {
  guess: number;
  result: SimResult;
}

interface TutorialContextValue {
  /** All completed step snapshots keyed by step index. */
  snapshots: Record<number, StepSnapshot>;
  /** Persist a completed step's guess + result. */
  saveSnapshot: (idx: number, guess: number, result: SimResult) => void;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [snapshots, setSnapshots] = useState<Record<number, StepSnapshot>>({});

  function saveSnapshot(idx: number, guess: number, result: SimResult) {
    setSnapshots((prev) => ({ ...prev, [idx]: { guess, result } }));
  }

  return (
    <TutorialContext.Provider value={{ snapshots, saveSnapshot }}>
      {children}
    </TutorialContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStepSnapshots(): TutorialContextValue {
  const ctx = useContext(TutorialContext);
  if (!ctx)
    throw new Error("useStepSnapshots must be used within TutorialProvider");
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePrevSnapshot(currentIndex: number): StepSnapshot {
  const { snapshots } = useStepSnapshots();
  const prev = snapshots[currentIndex - 1];
  if (!prev) throw new Error("No previous snapshot found");
  return prev;
}
