import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

test('shows a helpful message when git is not available', () => {
  const result = spawnSync(process.execPath, ['bin/gt.js', 'status'], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: '',
    },
  });

  assert.equal(result.status, 1);
  const output = `${result.stdout}${result.stderr}`;
  assert.match(output, /Git is not installed|not available|Not inside a git repository/i);
});
