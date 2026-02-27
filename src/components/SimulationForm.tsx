import type { Status } from "../types";
import { LabeledInput } from "./LabeledInput";
import { SectionHeading } from "./SectionHeading";

interface SimulationFormProps {
  influence: string;
  onInfluenceChange: (v: string) => void;
  population: string;
  onPopulationChange: (v: string) => void;
  connections: string;
  onConnectionsChange: (v: string) => void;
  ratio: string;
  onRatioChange: (v: string) => void;
  maxYears: string;
  onMaxYearsChange: (v: string) => void;
  status: Status;
  onSubmit: () => void;
}

export function SimulationForm({
  influence,
  onInfluenceChange,
  population,
  onPopulationChange,
  connections,
  onConnectionsChange,
  ratio,
  onRatioChange,
  maxYears,
  onMaxYearsChange,
  status,
  onSubmit,
}: SimulationFormProps) {
  return (
    <div className="mb-10">
      <SectionHeading>See Your Ripple Effect</SectionHeading>
      <p className="mb-4 text-gray-700">
        Imagine you genuinely influence just a few people each year—through
        conversation, shared experience, or leading by example. Those people, in
        turn, influence others. Each new person isn't just a recipient; they
        become a source. That's what makes the growth curve look so different
        from what our intuition predicts: it doesn't add, it multiplies.
      </p>
      <p className="mb-4 text-gray-700">
        The simulation runs year by year, spreading influence through a
        realistic social network where about 95% of relationships stay within
        close-knit communities and only ~5% act as bridges to the wider world.
        Start with a number that feels honest—even one or two per year produces
        results that tend to surprise people.
      </p>

      <form
        className="bg-gray-50 p-4 md:p-8 rounded-lg border-2 border-primary"
        onSubmit={(e) => {
          e.preventDefault();

          if (e.target.reportValidity()) {
            onSubmit();
          }
        }}
      >
        <div className="mb-5">
          <LabeledInput
            id="influence"
            // TODO: this isn't clear if it is asking them to estimate the impact of the simulation or
            // asking them how many they will personally influence.
            label="How many people do you think you could meaningfully influence each year?"
            value={influence}
            onChange={onInfluenceChange}
            required
            min="0"
            step="0.01"
            placeholder="Enter a number (e.g., 2)"
            hint="Be realistic—quality relationships matter more than quantity"
            variant="prominent"
          />
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
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledInput
                label="Total Population"
                value={population}
                onChange={onPopulationChange}
                min="1"
              />
              <LabeledInput
                label="Meaningful Relationships per Person"
                value={connections}
                onChange={onConnectionsChange}
                min="1"
              />
              <LabeledInput
                label="Within-Community Ratio"
                value={ratio}
                onChange={onRatioChange}
                min="0"
                max="1"
                step="0.0001"
                hint="5% of relationships act as bridges between groups"
              />
              <LabeledInput
                label="Max Simulation Years"
                value={maxYears}
                onChange={onMaxYearsChange}
                min="1"
              />
            </div>
          </div>
        </details>
      </form>
    </div>
  );
}
