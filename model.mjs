/**
 * DAEDORYX executive scenario engine.
 * Illustration only. Not customer telemetry, verified ROI, pricing, or a prediction.
 * All percentages are assumptions supplied by the person presenting the model.
 */
export const DEFAULT_SCENARIO = Object.freeze({
  volume: 15000,
  minutes: 18,
  coverage: 45,
  reduction: 35,
  hourly: 55,
  annualCost: 150000
});

const LIMITS = Object.freeze({
  volume: [1000, 100000],
  minutes: [5, 60],
  coverage: [10, 90],
  reduction: [10, 75],
  hourly: [25, 200],
  annualCost: [25000, 500000]
});

export function sanitizeScenario(input = {}) {
  const clean = {};
  for (const [key, [min, max]] of Object.entries(LIMITS)) {
    const n = Number(input[key] ?? DEFAULT_SCENARIO[key]);
    clean[key] = Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : DEFAULT_SCENARIO[key];
  }
  return clean;
}

export function calculateScenario(input = {}) {
  const assumptions = sanitizeScenario(input);
  const {volume, minutes, coverage, reduction, hourly, annualCost} = assumptions;
  const baselineMonthlyHours = volume * minutes / 60;
  const baselineAnnualHours = baselineMonthlyHours * 12;
  const coveredMonthlyItems = volume * coverage / 100;
  const releasedMonthlyHours = baselineMonthlyHours * coverage / 100 * reduction / 100;
  const releasedAnnualHours = releasedMonthlyHours * 12;
  const scenarioMonthlyHours = baselineMonthlyHours - releasedMonthlyHours;
  const shareReleased = baselineMonthlyHours > 0 ? releasedMonthlyHours / baselineMonthlyHours * 100 : 0;
  const capacityValue = releasedAnnualHours * hourly;
  const modeledNetValue = capacityValue - annualCost;
  const modeledROI = annualCost > 0 ? modeledNetValue / annualCost * 100 : null;
  const simplePaybackMonths = capacityValue > 0 ? annualCost / (capacityValue / 12) : null;
  return {assumptions, baselineMonthlyHours, baselineAnnualHours, coveredMonthlyItems,
    releasedMonthlyHours, releasedAnnualHours, scenarioMonthlyHours, shareReleased,
    capacityValue, modeledNetValue, modeledROI, simplePaybackMonths};
}

export function formatMoney(value, options = {}) {
  const {compact = true} = options;
  const negative = value < 0;
  const absolute = Math.abs(value);
  let result;
  if (compact && absolute >= 1000000) result = '$' + (absolute / 1000000).toFixed(2).replace(/0+$/,'').replace(/\.$/,'') + 'M';
  else if (compact && absolute >= 1000) result = '$' + (absolute / 1000).toFixed(1).replace(/\.0$/,'') + 'K';
  else result = '$' + Math.round(absolute).toLocaleString('en-US');
  return negative ? '−' + result : result;
}

export function formatInteger(value) {
  return Math.round(value).toLocaleString('en-US');
}
