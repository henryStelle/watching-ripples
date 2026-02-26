export interface SimParams {
  totalPopulation: number;
  avgConnections: number;
  withinRatio: number;
  connectionsBetween: number;
  maxYears: number;
}

export interface SimResult {
  years: number;
  peopleReached: number;
  percentage: string;
  yearlyGrowth: { people: number }[];
  endReason: "everyone_reached" | "network_saturation" | "max_time";
  totalPopulation: number;
}

export type Status = "idle" | "loading" | "done";
