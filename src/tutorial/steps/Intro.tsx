import type { OverrideProps } from "../types";

/**
 * Intro — fullOverride step.
 * No simulation; just the hook and the CTA to begin the tutorial.
 */
export function Intro({ onAdvance }: OverrideProps) {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto px-1">
      <div className="flex flex-col gap-4 text-gray-700 leading-relaxed">
        <p>
          Most of us feel this at some point: the world's problems are so vast,
          and our personal relationships so small, that what we do couldn't
          possibly affect the wider culture. This intuition feels
          responsible—humble, even—but it has a flaw.
        </p>
        <p>
          We're wired to think about change <strong>linearly</strong>: I
          influence a few people, they mention it to a few others, and the
          signal fades out. But that's not how influence through relationships
          actually spreads.
        </p>
        <p>
          When the people you reach become sources of influence themselves, the
          growth <strong>compounds</strong>—the same dynamic behind every
          fast-spreading idea, norm, or movement in history. Our intuitions
          about linear processes are decent. Our intuitions about exponential
          ones are reliably, demonstrably wrong.
        </p>
        <p className="text-gray-500 italic text-sm">
          We'll share the science behind what makes this work as we go. For
          now—let's start exploring it directly.
        </p>
      </div>

      <button
        onClick={onAdvance}
        className="w-full bg-primary text-white py-4 px-8 text-lg rounded-lg font-bold cursor-pointer transition-all hover:shadow-lg active:scale-95"
      >
        Begin the Tutorial →
      </button>
    </div>
  );
}
