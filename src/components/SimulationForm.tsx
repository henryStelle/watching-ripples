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
      <p className="mb-4 text-gray-700 text-justify">
        It can feel like our individual actions are just a drop in the bucket.
        But what if that drop creates ripples? Imagine you inspire just a few
        people each year to live more sustainably—maybe through conversation
        over a meal, working alongside them in a garden, or sharing what you've
        learned about creation care. What if those people, in turn, inspire
        others?
      </p>
      <p className="mb-4 text-gray-700 text-justify">
        This simulation shows how your "drop in the bucket" can ripple through a
        network, accounting for the reality that about 95% of relationships stay
        within close-knit communities. Watch how your influence could spread
        through authentic relationships.
      </p>

      <form
        className="bg-gray-50 p-8 rounded-lg border-2 border-primary"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="mb-5">
          <LabeledInput
            id="influence"
            label="How many people do you think you could meaningfully encourage toward environmental sensitivity each year?"
            value={influence}
            onChange={onInfluenceChange}
            min="0"
            step="0.01"
            placeholder="Enter a number (e.g., 3)"
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
          <div className="mt-4 p-4 bg-white rounded border border-gray-300">
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
