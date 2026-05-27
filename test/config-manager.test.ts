import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigManager } from '../src/modules/config-manager.js';

test('default config is valid', () => {
  const manager = new ConfigManager();
  const result = manager.validateConfig(manager.getConfig());
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('validateConfig flags invalid iterations and empty formats', () => {
  const manager = new ConfigManager();
  const config = manager.getConfig();
  config.benchmark.iterations = 0;
  config.output.formats = [];
  const result = manager.validateConfig(config);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length >= 2);
});

test('applyCommandLineOverrides prefers CLI options over defaults', () => {
  const manager = new ConfigManager();
  const benchmark = manager.applyCommandLineOverrides({
    models: ['gemma:2b'],
    iterations: 9,
    warmup: 0,
  });
  assert.deepEqual(benchmark.models, ['gemma:2b']);
  assert.equal(benchmark.iterations, 9);
  assert.equal(benchmark.warmupIterations, 0); // 0 must be respected, not replaced by default
});

test('applyCommandLineOverrides falls back to default prompts', () => {
  const manager = new ConfigManager();
  const benchmark = manager.applyCommandLineOverrides({ models: ['gemma:2b'] });
  assert.ok(benchmark.prompts.length > 0);
});
