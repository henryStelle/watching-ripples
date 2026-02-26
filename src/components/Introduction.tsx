import { SectionHeading } from "./SectionHeading";

export function Introduction() {
  return (
    <div className="mb-10">
      <SectionHeading>Do My Actions Actually Matter?</SectionHeading>
      <p className="mb-4 text-gray-700 text-justify">
        Most of us feel this at some point: the world's problems are so vast,
        and our personal relationships so small, that what we do couldn't
        possibly affect the wider culture. This intuition feels responsible—
        humble, even—but it has a flaw. We're wired to think about change{" "}
        <strong>linearly</strong>: I influence a few people, they mention it to
        a few others, and the signal fades out. But that's not how influence
        through relationships actually spreads.
      </p>
      <p className="mb-4 text-gray-700 text-justify">
        When the people you reach become sources of influence themselves, the
        growth <strong>compounds</strong>—the same dynamic behind every
        fast-spreading idea, norm, or movement in history. Our intuitions about
        linear processes are decent. Our intuitions about exponential ones are
        reliably, demonstrably wrong. This tool is designed to make that gap
        visible.
      </p>
      <div className="bg-amber-50 border-l-4 border-amber-400 p-5 my-5 rounded">
        <strong>The network science behind it:</strong> Research shows that{" "}
        <a
          href="https://ourworldindata.org/limits-personal-experience"
          target="_blank"
          className="text-primary underline hover:opacity-80"
        >
          the average American knows approximately 611 people by name
        </a>
        , but anthropologist Robin Dunbar's research finds that{" "}
        <a
          href="https://www.bbc.com/future/article/20191001-dunbars-number-why-we-can-only-maintain-150-relationships"
          target="_blank"
          className="text-primary underline hover:opacity-80"
        >
          we can only maintain about 150 meaningful relationships
        </a>
        —the kind where real influence travels. About{" "}
        <a
          href="https://www.cl.cam.ac.uk/~cm542/papers/icwsm12full.pdf"
          target="_blank"
          className="text-primary underline hover:opacity-80"
        >
          5% of those relationships act as bridges
        </a>{" "}
        between otherwise separate communities, and we're all connected within{" "}
        <a
          href="https://en.wikipedia.org/wiki/Six_degrees_of_separation"
          target="_blank"
          className="text-primary underline hover:opacity-80"
        >
          about six degrees of separation
        </a>
        . Even a small number of bridge connections is enough for a ripple to
        cross from one community into the next—and then compound from there.
      </div>
    </div>
  );
}
