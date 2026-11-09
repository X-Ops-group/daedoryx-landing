import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../demo-policy.js', import.meta.url), 'utf8');
const sandbox = { globalThis: {} };
vm.runInNewContext(source, sandbox, { filename: 'demo-policy.js' });
const { evaluation, SCENARIOS, AGENTS } = sandbox.globalThis.DaedoryxLabPolicy;
const clone = (value) => JSON.parse(JSON.stringify(value));

test('the sandbox has exactly 4 trusted demo identities and six named scenarios', () => {
  assert.equal(Object.values(AGENTS).filter(agent => agent.trusted).length, 4);
  assert.equal(SCENARIOS.length, 6);
  assert.equal(new Set(SCENARIOS.map(s => s.id)).size, 6);
});

test('safe staging release is allowed and every check is reported', () => {
  const result = evaluation(SCENARIOS[0]);
  assert.equal(result.decision, 'ALLOW');
  assert.equal(result.checks.length, 6);
  assert.equal(result.checks.filter(c => c.status === 'pass').length, 6);
});

test('tool egress guard denies synthetic exfiltration regardless of untrusted narrative', () => {
  const result = evaluation(SCENARIOS[1]);
  assert.equal(result.decision, 'DENY');
  assert.equal(result.checks.find(c => c.id === 'DLP-03').status, 'deny');
  assert.match(result.untrustedInputNotice, /does not run a model/);
  const withoutPromptCue = evaluation({ ...clone(SCENARIOS[1]), untrustedInput: false });
  assert.equal(withoutPromptCue.decision, 'DENY');
});

test('production deployment requires approval and then allows same scoped request', () => {
  const proposed = evaluation(SCENARIOS[2]);
  assert.equal(proposed.decision, 'REVIEW');
  assert.equal(proposed.checks.find(c => c.id === 'PROD-06').status, 'review');
  const approved = evaluation({ ...clone(SCENARIOS[2]), approved: true });
  assert.equal(approved.decision, 'ALLOW');
});

test('production containment requires review for security agent', () => {
  assert.equal(evaluation(SCENARIOS[3]).decision, 'REVIEW');
});

test('self-approved merge is always denied, even when approval flag is true', () => {
  const result = evaluation(SCENARIOS[4]);
  assert.equal(result.decision, 'DENY');
  assert.equal(result.checks.find(c => c.id === 'SOD-04').status, 'deny');
});

test('finance threshold holds, approves, and hard-denies excessive orders', () => {
  const base = clone(SCENARIOS[5]);
  assert.equal(evaluation(base).decision, 'REVIEW');
  assert.equal(evaluation({ ...base, approved: true }).decision, 'ALLOW');
  assert.equal(evaluation({ ...base, amount: 25001, approved: true }).decision, 'DENY');
  assert.equal(evaluation({ ...base, amount: 5000 }).decision, 'ALLOW');
});

test('unknown actors, out-of-scope tools and external export fail closed', () => {
  assert.equal(evaluation({ agent: 'unknown', action: 'read' }).decision, 'DENY');
  assert.equal(evaluation({ agent: 'analyst', action: 'deploy' }).decision, 'DENY');
  assert.equal(evaluation({ agent: 'analyst', action: 'export', destination: 'external' }).decision, 'DENY');
  assert.equal(evaluation({ agent: 'security', action: 'contain', environment: 'staging' }).decision, 'ALLOW');
});
