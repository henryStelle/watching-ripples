export interface SimParams {
  influencePerYear: number;
  totalPopulation: number;
  avgConnections: number;
  withinRatio: number;
  maxYears: number;
  trackAncestors: boolean;
}

export interface YearlyState {
  influenced: number; // cumulative count of people reached by the end of this year
  ancestors?: [number, number][]; // optional list of (influencer, influenced) pairs for this year
}

export interface SimResult {
  years: number;
  peopleReached: number;
  populationIncluded: number; // new field representing the fraction of the population reached
  yearlyState: YearlyState[];
  endReason: "everyone_reached" | "network_saturation" | "max_time";
  totalPopulation: number;
  startId: number; // the ID of the initial influencer
}

export type Status = "idle" | "loading" | "done";
