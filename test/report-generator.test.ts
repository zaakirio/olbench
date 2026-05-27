import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ReportGenerator } from '../src/modules/report-generator.js';
import type { BenchmarkReport } from '../src/modules/results-processor.js';
import type { SystemInfo } from '../src/modules/system-detection.js';

const systemInfo: SystemInfo = {
  totalRAM: 16,
  availableRAM: 12,
  os: 'darwin',
  architecture: 'arm64',
  gpus: [],
  cpu: { manufacturer: 'Apple', brand: 'M1', cores: 8, physicalCores: 8, speed: 3.2, flags: [] },
  ollamaVersion: '0.9.0',
  ollamaAvailable: true,
};

function buildReport(): BenchmarkReport {
  return {
    summary: {
      totalModels: 2,
      totalBenchmarks: 4,
      fastestModel: 'gemma:2b',
      slowestModel: 'mistral:7b',
      averageTokensPerSecond: 30,
      timestamp: new Date('2026-01-01T00:00:00Z'),
    },
    systemInfo,
    results: ['gemma:2b', 'mistral:7b'].map(model => ({
      model,
      tokensPerSecond: 30,
      firstTokenLatency: 25,
      totalLatency: 8000,
      memoryUsage: { peakMemoryUsage: 4700, averageMemoryUsage: 4700, memoryEfficiency: 0.05 },
      quality: { averageResponseLength: 200, responseTime: 8000, consistency: 95, completionRate: 100 },
      timestamp: new Date('2026-01-01T00:00:00Z'),
      systemInfo,
      rawMetrics: [],
    })),
    metadata: { version: '2.0.0', duration: 16000, configuration: {} },
  };
}

test('CSV report is multi-line (regression: literal \\n bug)', async () => {
  const gen = new ReportGenerator();
  const csv = await gen.generateReport(buildReport(), { format: 'csv' });
  assert.ok(!csv.includes('\\n'), 'CSV must not contain a literal backslash-n');
  const lines = csv.split('\n').filter(Boolean);
  // 1 header + 2 data rows
  assert.equal(lines.length, 3);
  assert.ok(lines[0].startsWith('Model,'));
});

test('Markdown report is multi-line and emoji-free', async () => {
  const gen = new ReportGenerator();
  const md = await gen.generateReport(buildReport(), { format: 'markdown' });
  assert.ok(!md.includes('\\n'), 'Markdown must not contain a literal backslash-n');
  assert.ok(md.split('\n').length > 10);
  assert.ok(md.startsWith('# Ollama Benchmark Report'));
});

test('HTML report contains no emoji characters', async () => {
  const gen = new ReportGenerator();
  const html = await gen.generateReport(buildReport(), { format: 'html' });
  assert.ok(!/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(html), 'HTML must be emoji-free');
});
