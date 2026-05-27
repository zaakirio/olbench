import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ResultsProcessor } from '../src/modules/results-processor.js';
import type { ModelBenchmarkResult, BenchmarkMetrics } from '../src/modules/benchmark-runner.js';
import type { SystemInfo } from '../src/modules/system-detection.js';

const systemInfo: SystemInfo = {
  totalRAM: 16,
  availableRAM: 12,
  os: 'linux',
  architecture: 'x64',
  gpus: [],
  cpu: { manufacturer: 'Intel', brand: 'i7', cores: 8, physicalCores: 4, speed: 3.5, flags: ['avx2'] },
  ollamaVersion: '0.9.0',
  ollamaAvailable: true,
};

function metric(model: string, overrides: Partial<BenchmarkMetrics> = {}): BenchmarkMetrics {
  return {
    model,
    prompt: 'p',
    iteration: 0,
    tokensPerSecond: 30,
    firstTokenLatency: 25,
    totalLatency: 8000,
    promptTokens: 10,
    completionTokens: 100,
    totalTokens: 110,
    memoryUsed: 4700,
    timestamp: new Date(),
    ...overrides,
  };
}

function modelResult(model: string, tps: number): ModelBenchmarkResult {
  const metrics = [metric(model, { tokensPerSecond: tps }), metric(model, { tokensPerSecond: tps })];
  return {
    model,
    metrics,
    averageTokensPerSecond: tps,
    averageFirstTokenLatency: 25,
    averageTotalLatency: 8000,
    minTokensPerSecond: tps,
    maxTokensPerSecond: tps,
    standardDeviation: 0,
  };
}

test('summary identifies fastest and slowest models', () => {
  const processor = new ResultsProcessor();
  const report = processor.processBenchmarkResults(
    [modelResult('fast', 50), modelResult('slow', 10)],
    systemInfo,
    new Date(Date.now() - 1000),
    {},
  );
  assert.equal(report.summary.fastestModel, 'fast');
  assert.equal(report.summary.slowestModel, 'slow');
  assert.equal(report.summary.totalModels, 2);
  assert.equal(report.summary.totalBenchmarks, 4);
});

test('memory efficiency is 0 when resident memory is unknown', () => {
  const processor = new ResultsProcessor();
  const result = modelResult('m', 30);
  result.metrics.forEach(m => { m.memoryUsed = 0; });
  const report = processor.processBenchmarkResults([result], systemInfo, new Date(), {});
  assert.equal(report.results[0].memoryUsage.memoryEfficiency, 0);
  assert.ok(Number.isFinite(report.results[0].memoryUsage.memoryEfficiency));
});

test('report metadata version matches package version', () => {
  const processor = new ResultsProcessor();
  const report = processor.processBenchmarkResults([modelResult('m', 30)], systemInfo, new Date(), {});
  assert.notEqual(report.metadata.version, '1.0.0');
  assert.match(report.metadata.version, /^\d+\.\d+\.\d+/);
});
