import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadConfig } from '../src/utils/config.js';

test('loadConfig returns defaults when no .gtrc exists', () => {
  const cfg = loadConfig();
  assert.equal(cfg.pushOnSave, true);
  assert.equal(cfg.defaultBranch, 'main');
});

test('loadConfig lets a local .gtrc override the defaults', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gt-cli-'));
  fs.writeFileSync(path.join(dir, '.gtrc'), JSON.stringify({ pushOnSave: false, defaultBranch: 'dev' }));

  const prev = process.cwd();
  process.chdir(dir);
  try {
    const cfg = loadConfig();
    assert.equal(cfg.pushOnSave, false);
    assert.equal(cfg.defaultBranch, 'dev');
  } finally {
    process.chdir(prev);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
