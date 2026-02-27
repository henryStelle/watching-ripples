import type { SimParams } from "../../types";

type ParamKey = Exclude<keyof SimParams, "trackAncestors" | "seed">;

interface Props {
  params: SimParams;
  /** If provided, only these keys will be shown (in this order) */
  show?: ParamKey[];
  /** Optional previous params to show deltas against */
  prevParams?: SimParams;
  className?: string;
}

interface ParamDisplayConfig {
  label: string; // no label means "don't show this param in the panel"
  tooltip?: string;
  transform?: (v: number) => number;
  format?: (v: number) => string;
}

const percentFormatter = new Intl.NumberFormat([], {
  style: "percent",
});

const numberFormatter = new Intl.NumberFormat([], {
  maximumFractionDigits: 2,
});

const DISPLAY_CONFIG: Record<ParamKey, ParamDisplayConfig> = {
  influencePerYear: {
    label: "Influence / person / year",
    tooltip: "Max number of relationships each person can influence per year",
  },
  avgConnections: {
    label: "Relationships / person",
  },
  withinRatio: {
    label: "Relationship bridge ratio",
    tooltip: "Fraction of relationships that are long-range bridges",
    transform: (v) => 1 - v,
    format: (v) => percentFormatter.format(v),
  },
  totalPopulation: {
    label: "Total people",
    tooltip:
      "Size of the network, mostly used for restricting simulation scale",
    format: (v) => numberFormatter.format(v),
  },
  maxYears: {
    label: "Max years",
    tooltip: "How long the simulation runs for",
  },
};

const DEFAULT_IDS = Object.keys(DISPLAY_CONFIG) as ParamKey[];

function getDelta(key: ParamKey, a: SimParams, b?: SimParams) {
  let cur = a[key];
  if (!b) return null;
  let prev = b[key];
  if (cur === prev) return null;

  const { transform, format } = DISPLAY_CONFIG[key];
  if (transform) {
    cur = transform(cur);
    prev = transform(prev);
  }

  const diff = cur - prev;
  const prefix = diff > 0 ? "+" : "";
  return {
    label: `${prefix}${format ? format(diff) : diff}`,
    isPositive: diff > 0,
  };
}

export function SimParamsPanel({
  params,
  show = DEFAULT_IDS,
  prevParams,
  className = "",
}: Props) {
  return (
    <div className={`bg-white border rounded p-4 text-sm ${className}`}>
      <h4 className="font-semibold text-gray-800 mb-2">
        Simulation Parameters
      </h4>
      <dl className="grid grid-cols-2 gap-y-2 gap-x-4">
        {show.map((key) => {
          const { label, transform, format } = DISPLAY_CONFIG[key];
          const value = transform ? transform(params[key]) : params[key];
          const formattedValue = format ? format(value) : value;

          const delta = getDelta(key, params, prevParams);

          return (
            <div key={key} className="flex items-baseline gap-2">
              <dt className="text-gray-600">{label}:</dt>
              <dd className="font-medium text-gray-900">{formattedValue}</dd>
              {delta && (
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    delta.isPositive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {delta.label}
                </span>
              )}
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export default SimParamsPanel;
