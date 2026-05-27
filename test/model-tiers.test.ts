import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ModelTierManager } from '../src/modules/model-tiers.js';
import { SystemDetector } from '../src/modules/system-detection.js';

test('getRAMTier maps RAM to the correct tier', () => {
  const detector = new SystemDetector();
  assert.equal(detector.getRAMTier(2), 0);
  assert.equal(detector.getRAMTier(4), 1);
  assert.equal(detector.getRAMTier(8), 2);
  assert.equal(detector.getRAMTier(16), 3);
  assert.equal(detector.getRAMTier(64), 4);
});

test('getModelsForRAM returns tier models sorted by priority', () => {
  const manager = new ModelTierManager();
  const models = manager.getModelsForRAM(8);
  assert.ok(models.length > 0);
  const priorities = models.map(m => m.priority);
  assert.deepEqual(priorities, [...priorities].sort((a, b) => a - b));
});

test('getHardwareAwareRecommendations only returns models that fit in effective RAM', () => {
  const manager = new ModelTierManager();
  const recs = manager.getHardwareAwareRecommendations({
    availableRAM: 8, // effective ~6GB
    totalRAM: 8,
    hasGPU: false,
    hasCUDA: false,
    architecture: 'arm64',
    os: 'darwin',
  }, 5);
  assert.ok(recs.length > 0);
  for (const model of recs) {
    assert.ok(model.memoryRequirement <= 6, `${model.name} requires ${model.memoryRequirement}GB`);
  }
});

test('getHardwareAwareRecommendations returns nothing for tiny RAM', () => {
  const manager = new ModelTierManager();
  const recs = manager.getHardwareAwareRecommendations({
    availableRAM: 2,
    totalRAM: 2,
    hasGPU: false,
    hasCUDA: false,
    architecture: 'x64',
    os: 'linux',
  });
  assert.equal(recs.length, 0);
});
