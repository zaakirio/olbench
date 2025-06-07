export { SystemDetector } from './modules/system-detection.js';
export { ModelTierManager } from './modules/model-tiers.js';
export { BenchmarkRunner } from './modules/benchmark-runner.js';
export { ResultsProcessor } from './modules/results-processor.js';
export { ConfigManager } from './modules/config-manager.js';

export type { SystemInfo, GPU } from './modules/system-detection.js';
export type { ModelConfig, ModelTier } from './modules/model-tiers.js';
export type { BenchmarkConfig, BenchmarkMetrics, ModelBenchmarkResult } from './modules/benchmark-runner.js';
export type { BenchmarkResult, BenchmarkReport, QualityMetrics, MemoryStats } from './modules/results-processor.js';
export type { AppConfig, CommandLineOptions } from './modules/config-manager.js';