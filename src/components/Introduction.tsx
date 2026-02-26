import { SectionHeading } from "./SectionHeading";

export function Introduction() {
  return (
    <div className="mb-10">
      <SectionHeading>Can Small Actions Really Make an Impact?</SectionHeading>
      <p className="mb-4 text-gray-700 text-justify">
        At{" "}
        <a
          href="https://windstonefarm.org"
          target="_blank"
          className="text-primary underline hover:opacity-80"
        >
          Windstone Farm
        </a>
        , we believe in the power of community and individual action. But can a
        small organization—or even you as an individual—truly make a difference
        in addressing environmental challenges?
      </p>
      <p className="mb-4 text-gray-700 text-justify">
        The answer is a resounding <strong>yes</strong>, and the math proves it.
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
        —the kind that go beyond just knowing someone's name. Additionally,
        research from{" "}
        <a
          href="https://www.cl.cam.ac.uk/~cm542/papers/icwsm12full.pdf"
          target="_blank"
          className="text-primary underline hover:opacity-80"
        >
          social network studies shows that about 5% of people act as perfect
          bridges
        </a>{" "}
        between otherwise separate groups. We're all connected within{" "}
        <a
          href="https://en.wikipedia.org/wiki/Six_degrees_of_separation"
          target="_blank"
          className="text-primary underline hover:opacity-80"
        >
          about six degrees of separation
        </a>
        . Through authentic relationships and genuine influence, your actions
        can ripple far beyond what you might imagine.
      </div>
    </div>
  );
}
