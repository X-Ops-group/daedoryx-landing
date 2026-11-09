import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SCENARIO, calculateScenario, sanitizeScenario, formatMoney, formatInteger } from '../model.mjs';

test('default scenario arithmetic is explicit and reproducible', () => {
  const s = calculateScenario(DEFAULT_SCENARIO);
  assert.equal(s.baselineMonthlyHours, 4500);
  assert.equal(s.baselineAnnualHours, 54000);
  assert.equal(s.coveredMonthlyItems, 6750);
  assert.equal(s.releasedMonthlyHours, 708.75);
  assert.equal(s.releasedAnnualHours, 8505);
  assert.equal(s.scenarioMonthlyHours, 3791.25);
  assert.equal(s.shareReleased, 15.75);
  assert.equal(s.capacityValue, 467775);
  assert.equal(s.modeledNetValue, 317775);
  assert.ok(Math.abs(s.modeledROI - 211.85) < 0.01);
});
test('input is constrained to the documented ranges', () => {
  const clean = sanitizeScenario({volume:-1,minutes:999,coverage:NaN,reduction:'broken',hourly:2,annualCost:9000000});
  assert.deepEqual(clean,{volume:1000,minutes:60,coverage:45,reduction:35,hourly:25,annualCost:500000});
});
test('economic opportunity increases monotonically with adopted coverage', () => {
  const low = calculateScenario({...DEFAULT_SCENARIO,coverage:20});
  const high = calculateScenario({...DEFAULT_SCENARIO,coverage:80});
  assert.ok(high.releasedAnnualHours > low.releasedAnnualHours);
  assert.ok(high.capacityValue > low.capacityValue);
  assert.equal(high.baselineAnnualHours,low.baselineAnnualHours);
});
test('negative modelled net value is possible and never hidden', () => {
  const s = calculateScenario({volume:1000,minutes:5,coverage:10,reduction:10,hourly:25,annualCost:500000});
  assert.ok(s.modeledNetValue < 0);
  assert.ok(s.modeledROI < 0);
  assert.ok(s.scenarioMonthlyHours >= 0);
});
test('formatting distinguishes opportunities from cash outcomes', () => {
  assert.equal(formatMoney(467775),'$467.8K');
  assert.equal(formatMoney(-5000),'−$5K');
  assert.equal(formatInteger(8505),'8,505');
});
