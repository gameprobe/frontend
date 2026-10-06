const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { test } = require('node:test');

// 기존 TypeScript 의존성으로 /connect 데모의 순수 상태 모듈만 검사한다.
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => {
  if (filename !== path.join(__dirname, 'consentDemo.ts')) throw new Error('Test loader scope exceeded');
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  module._compile(code, filename);
};
let reducer, initial;
try {
  ({ consentDemoReducer: reducer, initialConsentDemoState: initial } = require('./consentDemo.ts'));
} finally {
  if (previous) require.extensions['.ts'] = previous;
  else delete require.extensions['.ts'];
}
Object.freeze(initial);

function apply(state, ...actions) {
  return actions.reduce((current, action) => reducer(Object.freeze(current), action), state);
}

const begin = { type: 'begin' };
const accept = { type: 'accept', value: true };
const grant = { type: 'grant' };
const consent = () => apply(initial, begin);
const profile = () => apply(initial, begin, accept, grant);

test('unchecked consent cannot reveal the profile, including after unchecking', () => {
  assert.deepEqual(initial, { step: 'intro', accepted: false, outcome: null });
  const unchecked = consent();
  assert.equal(unchecked.accepted, false);
  assert.strictEqual(reducer(unchecked, grant), unchecked);
  const changedMind = apply(unchecked, accept, { type: 'accept', value: false }, grant);
  assert.deepEqual(changedMind, unchecked);
  assert.deepEqual(profile(), { step: 'profile', accepted: true, outcome: null });
});

test('cancelling a checked consent hides the profile and requires fresh consent', () => {
  const cancelled = apply(initial, begin, accept, { type: 'cancel' });
  assert.deepEqual(cancelled, { step: 'private', accepted: false, outcome: 'cancelled' });
  assert.strictEqual(reducer(cancelled, grant), cancelled);
  const retry = apply(cancelled, begin, grant);
  assert.deepEqual(retry, { step: 'consent', accepted: false, outcome: null });
  assert.equal(apply(retry, accept, grant).step, 'profile');
});

test('revocation removes prior consent and stale grant events cannot reveal the profile', () => {
  const revoked = apply(profile(), { type: 'revoke' });
  assert.deepEqual(revoked, { step: 'private', accepted: false, outcome: 'revoked' });
  assert.strictEqual(apply(revoked, accept, grant), revoked);
  const retry = apply(revoked, begin, grant);
  assert.deepEqual(retry, { step: 'consent', accepted: false, outcome: null });
  assert.equal(apply(retry, accept, grant).step, 'profile');
});

test('events arriving at the wrong step do not bypass or alter the current flow', () => {
  const cases = [
    [initial, [accept, grant, { type: 'cancel' }, { type: 'revoke' }]],
    [consent(), [begin, { type: 'revoke' }]],
    [profile(), [begin, accept, { type: 'accept', value: false }, grant, { type: 'cancel' }]],
    [apply(consent(), { type: 'cancel' }), [accept, grant, { type: 'cancel' }, { type: 'revoke' }]],
    [apply(profile(), { type: 'revoke' }), [accept, grant, { type: 'cancel' }, { type: 'revoke' }]],
  ];
  for (const [state, actions] of cases) {
    for (const action of actions) assert.strictEqual(reducer(state, action), state);
  }
});

test('reset from every reachable state starts an unchecked introduction', () => {
  const states = [
    initial,
    consent(),
    apply(consent(), accept),
    profile(),
    apply(consent(), { type: 'cancel' }),
    apply(profile(), { type: 'revoke' }),
  ];
  for (const state of states) {
    const reset = apply(state, { type: 'reset' });
    assert.deepEqual(reset, { step: 'intro', accepted: false, outcome: null });
    assert.strictEqual(apply(reset, accept, grant), reset);
    assert.equal(apply(reset, begin).accepted, false);
  }
});
