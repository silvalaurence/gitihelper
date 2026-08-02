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
  for (const command of ['init', 'save', 'sync', 'status', 'log', 'undo', 'cleanup', 'branch']) {
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

