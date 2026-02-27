import type { SimParams } from "../../types";

export const step1: SimParams = {
  influencePerYear: 2,
  totalPopulation: 50,
  avgConnections: 8,
  withinRatio: 1, // totally isolated populations so that growth is consistent and predictable
  maxYears: 2,
  trackAncestors: true,
  seed: 42,
};

export const step2: SimParams = {
  ...step1,
  avgConnections: 2,
};

export const step3: SimParams = {
  influencePerYear: 2,
  totalPopulation: 20,
  avgConnections: 3,
  withinRatio: 1.0, // all connections are local - no bridges whatsoever
  maxYears: 5,
  trackAncestors: true,
  seed: 42,
};

export const step4: SimParams = {
  ...step3,
  withinRatio: 0.99, // 1% of connections are long-range bridges
  seed: 63882010,
};

export const step5: SimParams = {
  ...step4,
  totalPopulation: 100000,
  avgConnections: 20,
  maxYears: 10,
  trackAncestors: true,
};
