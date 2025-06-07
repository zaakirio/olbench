# Ollama Benchmark Tool - Technical Documentation

Advanced technical documentation for developers, contributors, and power users.

## 🏗️ Architecture Overview

### Core Modules

```
src/
├── modules/
│   ├── system-detection.ts     # Hardware/OS detection
│   ├── model-tiers.ts          # RAM-based model management
│   ├── model-discovery.ts      # Dynamic model discovery
│   ├── benchmark-runner.ts     # Benchmark execution engine
│   ├── results-processor.ts    # Results analysis & comparison
│   ├── config-manager.ts       # YAML configuration handling
│   └── report-generator.ts     # Multi-format report generation
├── components/                 # React/Ink UI components (future)
├── simple-cli.ts              # Working CLI implementation
└── index.ts                   # Library exports
```

### Technology Stack
- **TypeScript** - Type safety and modern JavaScript features
- **Node.js 22** - Latest LTS with native fetch API
- **ESM Modules** - Modern JavaScript module system
- **Chalk** - Terminal colors and styling
- **Commander.js** - CLI argument parsing
- **YAML** - Human-readable configuration files
- **React/Ink** - Rich CLI components (future enhancement)

## 🔧 API Reference

### SystemDetector

```typescript
import { SystemDetector } from './modules/system-detection.js';

const detector = new SystemDetector();

// Get comprehensive system information
const systemInfo = await detector.detectSystem();

// Check Ollama availability
const isRunning = await detector.ensureOllamaRunning();

// Get RAM tier (1-4)
const tier = detector.getRAMTier(systemInfo.totalRAM);

// Format system info for display
const formatted = detector.formatSystemInfo(systemInfo);
```

### ModelDiscovery

```typescript
import { ModelDiscovery } from './modules/model-discovery.js';

const discovery = new ModelDiscovery();

// Get installed models with details
const installed = await discovery.getInstalledModels();

// Get popular models by category
const codeModels = discovery.getPopularModels('code');

// Get recommendations for specific RAM
const recommendations = await discovery.getModelRecommendations(24);

// Search models
const results = discovery.searchModels('llama');

// Install a model
await discovery.pullModel('gemma:2b');
```

### BenchmarkRunner

```typescript
import { BenchmarkRunner } from './modules/benchmark-runner.js';

const runner = new BenchmarkRunner();

// Create benchmark configuration
const config = BenchmarkRunner.createDefaultConfig(['gemma:2b']);

// Run benchmarks
const results = await runner.runBenchmark(config);

// Run concurrent benchmarks
const concurrentResults = await runner.runConcurrentBenchmark(
  'gemma:2b', 
  'Test prompt', 
  3, 
  300
);
```

### ResultsProcessor

```typescript
import { ResultsProcessor } from './modules/results-processor.js';

const processor = new ResultsProcessor();

// Process benchmark results
const report = processor.processBenchmarkResults(
  modelResults, 
  systemInfo, 
  startTime, 
  configuration
);

// Compare two reports
const comparison = processor.compareReports(baselineReport, currentReport);

// Format summary
const summary = processor.formatSummary(report);
```

### ReportGenerator

```typescript
import { ReportGenerator } from './modules/report-generator.js';

const generator = new ReportGenerator();

// Generate report in multiple formats
const jsonReport = await generator.generateReport(report, {
  format: 'json',
  outputPath: 'results.json',
  prettify: true
});

const htmlReport = await generator.generateReport(report, {
  format: 'html',
  outputPath: 'results.html',
  includeSystemInfo: true
});

// Generate comparison report
const comparisonReport = await generator.generateComparisonReport(
  comparison, 
  { format: 'markdown', outputPath: 'comparison.md' }
);
```

## 📊 Data Structures

### SystemInfo Interface
```typescript
interface SystemInfo {
  totalRAM: number;           // GB
  availableRAM: number;       // GB
  os: string;                 // Platform name
  architecture: string;       // CPU architecture
  gpus: GPU[];               // Graphics cards
  ollamaVersion: string | null;
  ollamaAvailable: boolean;
}

interface GPU {
  vendor: string;
  model: string;
  vram: number;              // MB
  driver: string;
}
```

### BenchmarkResult Interface
```typescript
interface BenchmarkResult {
  model: string;
  tokensPerSecond: number;
  firstTokenLatency: number;    // ms
  totalLatency: number;         // ms
  memoryUsage: MemoryStats;
  quality: QualityMetrics;
  timestamp: Date;
  systemInfo: SystemInfo;
  rawMetrics: BenchmarkMetrics[];
}

interface MemoryStats {
  peakMemoryUsage: number;      // MB
  averageMemoryUsage: number;   // MB
  memoryEfficiency: number;     // tokens per MB
}

interface QualityMetrics {
  averageResponseLength: number;
  responseTime: number;
  consistency: number;          // 0-100%
  completionRate: number;       // 0-100%
}
```

### ModelInfo Interface
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
  category: 'chat' | 'code' | 'vision' | 'reasoning';
  popularity: number;           // 0-100
}
```

## ⚙️ Configuration System

### Configuration File Structure
```yaml
version: "1.0.0"

benchmark:
  timeout: 300                 # Request timeout in seconds
  iterations: 5                # Benchmark runs per model
  concurrency: 1               # Concurrent requests
  warmupIterations: 2          # Warmup runs

ramTiers:
  tier1:
    minRam: 4
    maxRam: 7
    models:
      - name: "gemma:2b"
        priority: 1

prompts:
  default:
    - "Explain quantum computing in simple terms."
  coding:
    - "Write a Python function to sort a list."
  creative:
    - "Write a haiku about technology."
  reasoning:
    - "If a train travels 60mph for 2.5 hours, how far does it go?"

output:
  formats: ["json", "csv", "markdown", "html"]
  includeSystemInfo: true
  saveRawResponses: false
  directory: "./benchmark-results"

ollama:
  baseUrl: "http://localhost:11434"
  timeout: 300
  retries: 3
```

### Configuration Loading Priority
1. Command-line arguments (highest priority)
2. Custom config file (`--config path`)
3. Default config file (`config/default.yml`)
4. Built-in defaults (lowest priority)

### Environment Variables
```bash
OLLAMA_BASE_URL=http://localhost:11434
BENCHMARK_TIMEOUT=300
BENCHMARK_ITERATIONS=5
OUTPUT_DIRECTORY=./results
```

## 🔌 Ollama API Integration

### API Endpoints Used
- `GET /api/version` - Check Ollama version
- `GET /api/tags` - List installed models
- `POST /api/show` - Get model details
- `POST /api/pull` - Download models
- `POST /api/generate` - Generate text

### Request Format
```typescript
interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
  };
}
```

### Response Processing
```typescript
interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;      // nanoseconds
  load_duration?: number;       // nanoseconds
  prompt_eval_count?: number;   // tokens
  prompt_eval_duration?: number; // nanoseconds
  eval_count?: number;          // tokens
  eval_duration?: number;       // nanoseconds
}
```

## 📈 Performance Metrics

### Calculation Methods

#### Tokens Per Second
```typescript
const tokensPerSecond = completionTokens > 0 
  ? (completionTokens / evalTime) * 1000 
  : 0;
```

#### Memory Efficiency
```typescript
const memoryEfficiency = totalTokens / averageMemoryUsage;
```

#### Quality Consistency
```typescript
const mean = tokenCounts.reduce((sum, count) => sum + count, 0) / tokenCounts.length;
const variance = tokenCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / tokenCounts.length;
const standardDeviation = Math.sqrt(variance);
const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 1;
const consistency = Math.max(0, 100 - (coefficientOfVariation * 100));
```

### Statistical Analysis
- **Mean** - Average performance across iterations
- **Standard Deviation** - Performance consistency measure
- **Min/Max** - Performance range
- **Percentiles** - Distribution analysis (future enhancement)

## 🔄 Report Generation

### Output Formats

#### JSON Format
```json
{
  "summary": {
    "totalModels": 3,
    "totalBenchmarks": 15,
    "fastestModel": "mistral:7b",
    "slowestModel": "phi4:14b",
    "averageTokensPerSecond": 28.5,
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  "systemInfo": {...},
  "results": [...],
  "metadata": {
    "version": "1.0.0",
    "duration": 180000,
    "configuration": {...}
  }
}
```

#### CSV Format
```csv
Model,Tokens/sec,First Token Latency (ms),Total Latency (ms),Peak Memory (MB),Avg Memory (MB),Memory Efficiency,Response Length,Consistency (%),Completion Rate (%),Timestamp
mistral:7b,35.2,28,7234,125.4,98.2,0.36,142.5,94.2,100.0,2024-01-15T10:30:00.000Z
```

#### HTML Format
- Interactive performance charts
- Responsive design
- System information cards
- Performance comparison tables
- Exportable results

#### Markdown Format
- GitHub-compatible formatting
- System information summary
- Results tables
- Detailed analysis sections

## 🧪 Testing & Validation

### Unit Tests (Future)
```typescript
// Example test structure
describe('SystemDetector', () => {
  it('should detect RAM correctly', async () => {
    const detector = new SystemDetector();
    const info = await detector.detectSystem();
    expect(info.totalRAM).toBeGreaterThan(0);
  });
});
```

### Integration Tests (Future)
- Ollama API connectivity
- Model installation and removal
- End-to-end benchmark execution
- Report generation accuracy

### Performance Tests (Future)
- Memory leak detection
- Long-running stability
- Concurrent execution handling
- Large model benchmarking

## 🔧 Development Setup

### Prerequisites
- Node.js 22+
- TypeScript 5+
- Ollama installed locally

### Development Commands
```bash
# Install dependencies
npm install

# Development with hot reload
npm run dev

# Type checking
npm run typecheck

# Build for production
npm run build

# Code formatting
npm run format

# Linting
npm run lint
```

### Adding New Features

#### Adding a New Model Discovery Source
```typescript
// Extend ModelDiscovery class
class ModelDiscovery {
  async getModelsFromHub(): Promise<PopularModel[]> {
    // Implement hub API integration
  }
}
```

#### Adding New Benchmark Metrics
```typescript
// Extend BenchmarkMetrics interface
interface ExtendedBenchmarkMetrics extends BenchmarkMetrics {
  customMetric: number;
}

// Update benchmark runner
class BenchmarkRunner {
  private calculateCustomMetric(response: string): number {
    // Implement custom metric calculation
  }
}
```

#### Adding New Output Formats
```typescript
// Extend ReportGenerator
class ReportGenerator {
  private generateXmlReport(report: BenchmarkReport): string {
    // Implement XML generation
  }
}
```

## 🐛 Debugging

### Debug Mode
```bash
# Enable verbose logging
DEBUG=ollama-bench* olbench info --verbose

# Log Ollama API calls
DEBUG=ollama-api olbench run
```

### Common Debug Scenarios

#### Ollama Connection Issues
```typescript
// Check connectivity
const response = await fetch('http://localhost:11434/api/version');
console.log('Ollama status:', response.status);
```

#### Model Loading Problems
```typescript
// Verify model availability
const models = await discovery.getInstalledModels();
console.log('Available models:', models.map(m => m.name));
```

#### Performance Anomalies
```typescript
// Add timing logs
console.time('benchmark');
const result = await runner.runBenchmark(config);
console.timeEnd('benchmark');
```

## 🚀 Deployment

### Production Build
```bash
npm run build
chmod +x dist/simple-cli.js
```

### Global Installation
```bash
npm link
olbench info
```

### Docker Deployment (Future)
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
CMD ["node", "dist/simple-cli.js"]
```

## 🔮 Future Enhancements

### Planned Features
- [ ] React/Ink UI when compatibility is resolved
- [ ] Real-time performance monitoring
- [ ] Custom model support
- [ ] A/B testing framework
- [ ] Integration with MLOps tools
- [ ] Cost analysis (performance per watt)
- [ ] Automated model recommendations
- [ ] Performance regression detection

### API Improvements
- [ ] REST API for programmatic access
- [ ] WebSocket for real-time updates
- [ ] GraphQL interface
- [ ] Plugin system for extensions

### Platform Support
- [ ] Windows ARM64
- [ ] Docker containers
- [ ] Cloud deployment
- [ ] CI/CD integrations

---

For questions about implementation details or contributing, please see the [Contributing Guide](CONTRIBUTING.md).