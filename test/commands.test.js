import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function run(args, opts = {}) {
  return spawnSync(process.execPath, ['bin/gt.js', ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    ...opts,
  });
}

test('--help lists every command', () => {
  const result = run(['--help']);
  assert.equal(result.status, 0);
  for (const command of ['init', 'save', 'sync', 'status', 'log', 'undo', 'cleanup', 'branch', 'amend', 'squash', 'diff', 'stash', 'switch']) {
    assert.match(result.stdout, new RegExp(command));
  }
});

test('gt init shows a helpful message when git is unavailable', () => {
  const result = run(['init', 'first commit']);
  assert.equal(result.status, 1);
  const output = `${result.stdout}${result.stderr}`;
  assert.match(output, /Git is not installed|not available|not recognized|Not inside a git repository/i);
});

test('gt log shows a helpful message outside a git repo', () => {
  const result = run(['log']);
  assert.equal(result.status, 1);
  const output = `${result.stdout}${result.stderr}`;
  assert.match(output, /Git is not installed|not available|Not inside a git repository/i);
});

test('gt undo shows a helpful message outside a git repo', () => {
  const result = run(['undo']);
  assert.equal(result.status, 1);
  const output = `${result.stdout}${result.stderr}`;
  assert.match(output, /Git is not installed|not available|Not inside a git repository/i);
});

test('gt save shows a helpful message outside a git repo', () => {
  const result = run(['save', 'test message']);
  assert.equal(result.status, 1);
  const output = `${result.stdout}${result.stderr}`;
  assert.match(output, /Git is not installed|not available|Not inside a git repository/i);
});

test('gt branch shows a helpful message outside a git repo', () => {
  const result = run(['branch', 'login']);
  assert.equal(result.status, 1);
  const output = `${result.stdout}${result.stderr}`;
  assert.match(output, /Git is not installed|not available|not recognized|Not inside a git repository/i);
});

test('gt amend shows a helpful message outside a git repo', () => {
  const result = run(['amend', 'new message']);
  assert.equal(result.status, 1);
  const output = `${result.stdout}${result.stderr}`;
  assert.match(output, /Git is not installed|not available|not recognized|Not inside a git repository/i);
});

test('gt squash shows a helpful message outside a git repo', () => {
  const result = run(['squash', '3', 'combined message']);
  assert.equal(result.status, 1);
  const output = `${result.stdout}${result.stderr}`;
  assert.match(output, /Git is not installed|not available|not recognized|Not inside a git repository/i);
});

test('gt squash validates the commit count', () => {
  const result = run(['squash', '1', 'combined message']);
  assert.equal(result.status, 1);
  const output = `${result.stdout}${result.stderr}`;
  assert.match(output, /count of at least 2|Git is not installed|not available|Not inside a git repository/i);
});

test('gt diff shows a helpful message outside a git repo', () => {
  const result = run(['diff']);
  assert.equal(result.status, 1);
  const output = `${result.stdout}${result.stderr}`;
  assert.match(output, /Git is not installed|not available|not recognized|Not inside a git repository/i);
});

test('gt stash shows a helpful message outside a git repo', () => {
  const result = run(['stash']);
  assert.equal(result.status, 1);
  const output = `${result.stdout}${result.stderr}`;
  assert.match(output, /Git is not installed|not available|not recognized|Not inside a git repository/i);
});

test('gt switch shows a helpful message outside a git repo', () => {
  const result = run(['switch', 'main']);
  assert.equal(result.status, 1);
  const output = `${result.stdout}${result.stderr}`;
  assert.match(output, /Git is not installed|not available|not recognized|Not inside a git repository/i);
});

test('gt status shows a helpful message outside a git repo', () => {
  const result = run(['status']);
  assert.equal(result.status, 1);
  const output = `${result.stdout}${result.stderr}`;
  assert.match(output, /Git is not installed|not available|not recognized|Not inside a git repository/i);
});

test('gt sync shows a helpful message outside a git repo', () => {
  const result = run(['sync']);
  assert.equal(result.status, 1);
  const output = `${result.stdout}${result.stderr}`;
  assert.match(output, /Git is not installed|not available|not recognized|Not inside a git repository/i);
});

test('gt cleanup shows a helpful message outside a git repo', () => {
  const result = run(['cleanup']);
  assert.equal(result.status, 1);
  const output = `${result.stdout}${result.stderr}`;
  assert.match(output, /Git is not installed|not available|not recognized|Not inside a git repository/i);
});

