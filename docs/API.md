# Ollama Benchmark Tool - API Reference

Complete API documentation for using the Ollama Benchmark Tool as a library or extending its functionality.

## 📦 Installation as Library

```bash
npm install ollama-benchmark-node
```

```typescript
import { 
  SystemDetector, 
  ModelDiscovery, 
  BenchmarkRunner,
  ResultsProcessor,
  ReportGenerator
} from 'ollama-benchmark-node';
```

## 🔧 Core APIs

### SystemDetector

Detects system capabilities and Ollama status.

#### Methods

##### `detectSystem(): Promise<SystemInfo>`
Get comprehensive system information including RAM, OS, GPUs, and Ollama status.

```typescript
const detector = new SystemDetector();
const systemInfo = await detector.detectSystem();

console.log(`RAM: ${systemInfo.totalRAM}GB`);
console.log(`OS: ${systemInfo.os}`);
console.log(`Ollama: ${systemInfo.ollamaAvailable ? 'Running' : 'Not found'}`);
```

##### `ensureOllamaRunning(): Promise<boolean>`
Check if Ollama is running with retry logic.

```typescript
const isRunning = await detector.ensureOllamaRunning();
if (!isRunning) {
  throw new Error('Ollama is not available');
}
```

##### `getRAMTier(totalRAM: number): number`
Get RAM tier (1-4) based on available memory.

```typescript
const tier = detector.getRAMTier(16); // Returns 3 for 16GB RAM
```

##### `formatSystemInfo(info: SystemInfo): string`
Format system information for display.

```typescript
const formatted = detector.formatSystemInfo(systemInfo);
console.log(formatted);
```

#### Interfaces

```typescript
interface SystemInfo {
  totalRAM: number;
  availableRAM: number;
  os: string;
  architecture: string;
  gpus: GPU[];
  ollamaVersion: string | null;
  ollamaAvailable: boolean;
}

interface GPU {
  vendor: string;
  model: string;
  vram: number;
  driver: string;
}
```

### ModelDiscovery

Discover, search, and manage available models.

#### Methods

##### `getInstalledModels(): Promise<ModelInfo[]>`
Get list of currently installed Ollama models with details.

```typescript
const discovery = new ModelDiscovery();
const installed = await discovery.getInstalledModels();

installed.forEach(model => {
  console.log(`${model.name}: ${model.sizeGB.toFixed(1)}GB`);
});
```

##### `getPopularModels(category?: ModelCategory): PopularModel[]`
Get popular models, optionally filtered by category.

```typescript
// All popular models
const allModels = discovery.getPopularModels();

// Code-specific models
const codeModels = discovery.getPopularModels('code');
```

##### `getRecommendedModelsForRAM(ramGB: number, category?: ModelCategory): PopularModel[]`
Get models recommended for specific RAM amount.

```typescript
const recommended = discovery.getRecommendedModelsForRAM(16, 'chat');
console.log(`Found ${recommended.length} chat models for 16GB RAM`);
```

##### `getModelRecommendations(ramGB: number): Promise<ModelRecommendations>`
Get comprehensive recommendations including installed and available models.

```typescript
const recommendations = await discovery.getModelRecommendations(24);

console.log('Installed:', recommendations.installed.length);
console.log('Can install:', recommendations.canInstall.length);
```

##### `pullModel(modelName: string): Promise<void>`
Download and install a model.

```typescript
await discovery.pullModel('gemma:2b');
console.log('Model installed successfully');
```

##### `checkModelExists(modelName: string): Promise<boolean>`
Check if a model is available locally.

```typescript
const exists = await discovery.checkModelExists('llama3.1:8b');
if (!exists) {
  await discovery.pullModel('llama3.1:8b');
}
```

##### `searchModels(query: string): PopularModel[]`
Search models by name or description.

```typescript
const results = discovery.searchModels('deepseek');
results.forEach(model => {
  console.log(`${model.name}: ${model.description}`);
});
```

##### `getTrendingModels(): PopularModel[]`
Get currently trending/popular models.

```typescript
const trending = discovery.getTrendingModels();
console.log('Top trending model:', trending[0].name);
```

#### Interfaces

```typescript
interface ModelInfo {
  name: string;
  family: string;
  parameterSize: string;
  sizeGB: number;
  quantization: string;
  isInstalled: boolean;
  recommendedForRAM: number[];
}

interface PopularModel {
  name: string;
  description: string;
  family: string;
  parameterSize: string;
  minRAM: number;
  category: ModelCategory;
  popularity: number;
}

type ModelCategory = 'chat' | 'code' | 'vision' | 'reasoning';

interface ModelRecommendations {
  installed: ModelInfo[];
  recommended: PopularModel[];
  canInstall: PopularModel[];
}
```

### BenchmarkRunner

Execute performance benchmarks on models.

#### Methods

##### `runBenchmark(config: BenchmarkConfig): Promise<ModelBenchmarkResult[]>`
Run comprehensive benchmark on multiple models.

```typescript
const runner = new BenchmarkRunner();

const config: BenchmarkConfig = {
  models: ['gemma:2b', 'mistral:7b'],
  prompts: ['Hello, how are you?', 'Explain quantum computing'],
  iterations: 3,
  concurrency: 1,
  timeout: 300,
  warmupIterations: 1
};

const results = await runner.runBenchmark(config);
console.log(`Benchmarked ${results.length} models`);
```

##### `runSingleBenchmark(model: string, prompt: string, iteration: number, timeout: number): Promise<BenchmarkMetrics | null>`
Run single benchmark test.

```typescript
const metrics = await runner.runSingleBenchmark(
  'gemma:2b',
  'Hello world',
  0,
  300
);

if (metrics) {
  console.log(`Speed: ${metrics.tokensPerSecond.toFixed(1)} tok/s`);
}
```

##### `runConcurrentBenchmark(model: string, prompt: string, concurrency: number, timeout: number): Promise<BenchmarkMetrics[]>`
Run concurrent benchmark tests.

```typescript
const concurrentResults = await runner.runConcurrentBenchmark(
  'mistral:7b',
  'Test prompt',
  3,
  300
);

console.log(`${concurrentResults.length} concurrent tests completed`);
```

##### Static Methods

##### `getDefaultPrompts(): string[]`
Get default benchmark prompts.

```typescript
const prompts = BenchmarkRunner.getDefaultPrompts();
console.log(`Using ${prompts.length} default prompts`);
```

##### `createDefaultConfig(models: string[]): BenchmarkConfig`
Create default benchmark configuration.

```typescript
const config = BenchmarkRunner.createDefaultConfig(['gemma:2b']);
// Customize config as needed
config.iterations = 10;
```

#### Interfaces

```typescript
interface BenchmarkConfig {
  models: string[];
  prompts: string[];
  iterations: number;
  concurrency: number;
  timeout: number;
  warmupIterations?: number;
}

interface BenchmarkMetrics {
  model: string;
  prompt: string;
  iteration: number;
  tokensPerSecond: number;
  firstTokenLatency: number;
  totalLatency: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  memoryUsed: number;
  timestamp: Date;
}

interface ModelBenchmarkResult {
  model: string;
  metrics: BenchmarkMetrics[];
  averageTokensPerSecond: number;
  averageFirstTokenLatency: number;
  averageTotalLatency: number;
  minTokensPerSecond: number;
  maxTokensPerSecond: number;
  standardDeviation: number;
}
```

### ResultsProcessor

Process and analyze benchmark results.

#### Methods

##### `processBenchmarkResults(modelResults: ModelBenchmarkResult[], systemInfo: SystemInfo, startTime: Date, configuration: any): BenchmarkReport`
Process raw benchmark results into structured report.

```typescript
const processor = new ResultsProcessor();

const report = processor.processBenchmarkResults(
  modelResults,
  systemInfo,
  startTime,
  benchmarkConfig
);

console.log(`Report for ${report.summary.totalModels} models`);
```

##### `compareReports(baseline: BenchmarkReport, current: BenchmarkReport): ComparisonReport`
Compare two benchmark reports.

```typescript
const comparison = processor.compareReports(oldReport, newReport);

console.log(`Speed improvement: ${comparison.summary.averageSpeedImprovement.toFixed(1)}%`);
```

##### `formatSummary(report: BenchmarkReport): string`
Format report summary for display.

```typescript
const summary = processor.formatSummary(report);
console.log(summary);
```

#### Interfaces

```typescript
interface BenchmarkReport {
  summary: {
    totalModels: number;
    totalBenchmarks: number;
    fastestModel: string;
    slowestModel: string;
    averageTokensPerSecond: number;
    timestamp: Date;
  };
  systemInfo: SystemInfo;
  results: BenchmarkResult[];
  metadata: {
    version: string;
    duration: number;
    configuration: any;
  };
}

interface BenchmarkResult {
  model: string;
  tokensPerSecond: number;
  firstTokenLatency: number;
  totalLatency: number;
  memoryUsage: MemoryStats;
  quality: QualityMetrics;
  timestamp: Date;
  systemInfo: SystemInfo;
  rawMetrics: BenchmarkMetrics[];
}

interface ComparisonReport {
  baseline: ReportSummary;
  current: ReportSummary;
  comparisons: ModelComparison[];
  summary: {
    modelsCompared: number;
    averageSpeedImprovement: number;
    averageLatencyImprovement: number;
  };
}
```

### ReportGenerator

Generate reports in multiple formats.

#### Methods

##### `generateReport(report: BenchmarkReport, options: ReportOptions): Promise<string>`
Generate report in specified format.

```typescript
const generator = new ReportGenerator();

// JSON report
const jsonReport = await generator.generateReport(report, {
  format: 'json',
  outputPath: 'results.json',
  prettify: true
});

// HTML report
const htmlReport = await generator.generateReport(report, {
  format: 'html',
  outputPath: 'results.html',
  includeSystemInfo: true
});
```

##### `generateComparisonReport(comparison: ComparisonReport, options: ReportOptions): Promise<string>`
Generate comparison report.

```typescript
const comparisonReport = await generator.generateComparisonReport(
  comparison,
  {
    format: 'markdown',
    outputPath: 'comparison.md'
  }
);
```

##### Static Methods

##### `generateFilename(format: OutputFormat, prefix?: string): string`
Generate filename with timestamp.

```typescript
const filename = ReportGenerator.generateFilename('html', 'benchmark');
// Returns: benchmark-2024-01-15.html
```

##### `getMimeType(format: OutputFormat): string`
Get MIME type for format.

```typescript
const mimeType = ReportGenerator.getMimeType('json');
// Returns: application/json
```

#### Interfaces

```typescript
interface ReportOptions {
  format: OutputFormat;
  outputPath?: string;
  includeRawData?: boolean;
  includeSystemInfo?: boolean;
  prettify?: boolean;
}

type OutputFormat = 'json' | 'csv' | 'markdown' | 'html';
```

## 🔧 Configuration API

### ConfigManager

Manage benchmark configurations.

#### Methods

##### `loadConfig(configPath?: string): Promise<AppConfig>`
Load configuration from file or defaults.

```typescript
const configManager = new ConfigManager();

// Load default config
await configManager.loadConfig();

// Load custom config
await configManager.loadConfig('./my-config.yml');
```

##### `saveConfig(config: AppConfig, configPath?: string): Promise<void>`
Save configuration to file.

```typescript
const config = configManager.getConfig();
config.benchmark.iterations = 10;
await configManager.saveConfig(config, './custom-config.yml');
```

##### `applyCommandLineOverrides(options: CommandLineOptions): BenchmarkConfig`
Apply CLI options to config.

```typescript
const benchmarkConfig = configManager.applyCommandLineOverrides({
  models: ['gemma:2b'],
  iterations: 5,
  timeout: 300
});
```

##### `validateConfig(config: AppConfig): ValidationResult`
Validate configuration.

```typescript
const validation = configManager.validateConfig(config);
if (!validation.valid) {
  console.error('Config errors:', validation.errors);
}
```

##### `generateSampleConfig(outputPath: string): Promise<void>`
Generate sample configuration file.

```typescript
await configManager.generateSampleConfig('./sample-config.yml');
```

#### Interfaces

```typescript
interface AppConfig {
  version: string;
  benchmark: BenchmarkSettings;
  ramTiers: RamTierConfig;
  prompts: PromptSets;
  output: OutputSettings;
  ollama: OllamaSettings;
}

interface CommandLineOptions {
  models?: string[];
  config?: string;
  tier?: number;
  output?: string;
  format?: string;
  iterations?: number;
  concurrency?: number;
  timeout?: number;
  prompts?: string[];
  verbose?: boolean;
  warmup?: number;
}
```

## 🔄 Event System (Future)

Future versions will include an event system for monitoring:

```typescript
// Example future API
const runner = new BenchmarkRunner();

runner.on('modelStart', (model: string) => {
  console.log(`Starting benchmark for ${model}`);
});

runner.on('progress', (progress: { current: number, total: number }) => {
  console.log(`Progress: ${progress.current}/${progress.total}`);
});

runner.on('modelComplete', (result: ModelBenchmarkResult) => {
  console.log(`Completed ${result.model}: ${result.averageTokensPerSecond} tok/s`);
});
```

## 🚀 Example Use Cases

### Custom Benchmark Script

```typescript
import { 
  SystemDetector, 
  ModelDiscovery, 
  BenchmarkRunner, 
  ResultsProcessor,
  ReportGenerator 
} from 'ollama-benchmark-node';

async function customBenchmark() {
  // Detect system
  const detector = new SystemDetector();
  const systemInfo = await detector.detectSystem();
  
  // Discover models
  const discovery = new ModelDiscovery();
  const recommendations = await discovery.getModelRecommendations(systemInfo.totalRAM);
  
  // Select top 3 models
  const modelsToTest = recommendations.canInstall
    .slice(0, 3)
    .map(m => m.name);
  
  // Run benchmark
  const runner = new BenchmarkRunner();
  const config = runner.createDefaultConfig(modelsToTest);
  config.iterations = 3;
  
  const results = await runner.runBenchmark(config);
  
  // Process results
  const processor = new ResultsProcessor();
  const report = processor.processBenchmarkResults(
    results, 
    systemInfo, 
    new Date(), 
    config
  );
  
  // Generate report
  const generator = new ReportGenerator();
  await generator.generateReport(report, {
    format: 'html',
    outputPath: 'custom-benchmark.html'
  });
  
  console.log('Custom benchmark completed!');
}

customBenchmark().catch(console.error);
```

### Model Performance Monitor

```typescript
async function monitorModel(modelName: string) {
  const runner = new BenchmarkRunner();
  const config = runner.createDefaultConfig([modelName]);
  config.iterations = 1;
  
  setInterval(async () => {
    const results = await runner.runBenchmark(config);
    const performance = results[0].averageTokensPerSecond;
    
    console.log(`${modelName}: ${performance.toFixed(1)} tok/s`);
    
    // Alert if performance drops
    if (performance < 20) {
      console.warn('⚠️ Performance degradation detected!');
    }
  }, 60000); // Check every minute
}
```

### A/B Testing Framework

```typescript
async function compareModels(modelA: string, modelB: string) {
  const runner = new BenchmarkRunner();
  const config = runner.createDefaultConfig([modelA, modelB]);
  
  const results = await runner.runBenchmark(config);
  const processor = new ResultsProcessor();
  
  const [resultA, resultB] = results;
  
  console.log(`${modelA}: ${resultA.averageTokensPerSecond.toFixed(1)} tok/s`);
  console.log(`${modelB}: ${resultB.averageTokensPerSecond.toFixed(1)} tok/s`);
  
  const improvement = ((resultB.averageTokensPerSecond - resultA.averageTokensPerSecond) / resultA.averageTokensPerSecond) * 100;
  
  console.log(`${modelB} is ${improvement.toFixed(1)}% ${improvement > 0 ? 'faster' : 'slower'} than ${modelA}`);
}
```

---

For more examples and advanced usage patterns, see the [User Guide](USER-GUIDE.md) and [Technical Documentation](TECHNICAL.md).