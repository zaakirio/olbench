# olbench

**A Node.js benchmarking tool for Ollama local LLMs.**

[![npm version](https://badge.fury.io/js/olbench.svg)](https://www.npmjs.com/package/olbench)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

olbench detects your system capabilities, recommends models that fit your hardware,
and produces accurate performance benchmarks for locally running Ollama models. It
measures real throughput, true time-to-first-token, and actual model memory usage,
then exports the results as JSON, CSV, Markdown, or HTML.

## Features

- **Hardware-aware recommendations** — scores your CPU, GPU/VRAM, and available RAM to suggest models that will actually run well.
- **System detection** — reports OS, architecture, CPU, RAM, GPUs (including NVIDIA CUDA capability), and the running Ollama version.
- **Accurate metrics** — throughput (tokens/sec), true streamed time-to-first-token, total latency, resident model memory, and response quality.
- **Model discovery** — browse popular models by category, search, check download sizes, and pull models through Ollama.
- **Multiple report formats** — JSON, CSV, Markdown, and HTML.
- **Flexible configuration** — YAML config files with command-line overrides.

## Requirements

- Node.js 22 or newer (for native `fetch` and ESM support)
- [Ollama](https://ollama.com) installed and running
- 4GB RAM minimum (8GB or more recommended)

## Installation

```bash
npm install -g olbench
```

## Quick Start

```bash
# Inspect your system and see recommended models
olbench info

# Discover models that fit your hardware
olbench discover

# Install a model through Ollama
ollama pull gemma:2b

# Run a benchmark
olbench run --models "gemma:2b" --iterations 5
```

## Commands

### `olbench info`

Display system information, hardware score, and hardware-aware model recommendations.

```bash
olbench info              # System summary and recommendations
olbench info --verbose    # Also list every tier and its models
```

### `olbench discover`

Explore and manage available models.

```bash
olbench discover                        # Recommendations for your RAM
olbench discover --category code        # Filter by category (chat, code, vision, reasoning)
olbench discover --search "llama"       # Search by name or description
olbench discover --trending             # Most popular models
olbench discover --installed            # Models already installed locally
olbench discover --size "llama3.1:8b"   # Estimate download size
olbench discover --pull "gemma:2b"      # Install a model via Ollama
```

### `olbench run`

Execute benchmarks.

```bash
olbench run                                 # Auto-select models for your hardware
olbench run --models "gemma:2b,phi3:3.8b"   # Specific models
olbench run --tier 2                        # Top models from a RAM tier
olbench run --iterations 10                 # More iterations per model
olbench run --warmup 2                      # Warmup runs before measuring
olbench run --prompts coding                # Prompt set: default, coding, creative, reasoning
olbench run --output results.csv --format csv   # Save a report (json, csv, markdown, html)
```

### `olbench config`

Manage configuration.

```bash
olbench config --generate config.yaml   # Write a sample config file
olbench config --validate config.yaml   # Validate a config file
olbench config --show                    # Print the effective configuration
```

## Configuration

Create a `config.yaml` for persistent settings, then pass it with `--config`:

```yaml
benchmark:
  iterations: 5
  concurrency: 1
  timeout: 300
  warmupIterations: 2

prompts:
  default:
    - "Explain quantum computing in simple terms."
    - "Write a Python function to calculate the Fibonacci sequence."

output:
  formats: ["json", "csv", "markdown"]
  includeSystemInfo: true
  directory: "./benchmark-results"

ollama:
  baseUrl: "http://localhost:11434"
  timeout: 300
  retries: 3
```

Generate a fully-populated sample with `olbench config --generate config.yaml`.

### Connecting to a remote Ollama

olbench honours the standard `OLLAMA_HOST` environment variable. Set it to point at a
non-default host or port:

```bash
OLLAMA_HOST=http://192.168.1.50:11434 olbench info
```

When unset, olbench uses `http://localhost:11434`.

## Metrics

For each model, olbench reports:

| Metric | Description |
|--------|-------------|
| Tokens/sec | Generation throughput, computed from Ollama's `eval_count` / `eval_duration`. |
| First token | True time-to-first-token, measured from the streamed response (wall clock from request to the first generated token). |
| Total time | End-to-end latency of the request. |
| Model memory | Resident memory of the loaded model (RAM + VRAM), read from Ollama's `/api/ps`. |
| Quality | Response consistency and completion rate across iterations. |

## RAM Tiers

Recommendations start from a RAM tier and are then refined by the hardware score
(CPU, GPU/VRAM, architecture).

| Tier | RAM Range | Example Models |
|------|-----------|----------------|
| 1 | 4–7GB | gemma:2b, phi:2.7b, phi3:3.8b |
| 2 | 8–15GB | llama3.1:8b, mistral:7b, gemma2:9b |
| 3 | 16–31GB | gemma2:9b, deepseek-r1:14b, llava:13b |
| 4 | 32GB+ | phi4:14b, deepseek-r1:32b |

## Example Output

### System information

```
System Information

Basic Information:
  Operating System: darwin (arm64)
  CPU: Apple M3 (8 cores @ 2.4GHz)
  Total RAM: 24GB
  Available RAM: 16GB (14GB effective)
  RAM Tier: Tier 3 (16GB-31GB)
  Hardware Score: 30.8/100 (CPU: 22.0, GPU: 0.0)

Ollama Status:
  Status: Running
  Version: v0.9.0
```

### Benchmark results

```
Benchmark completed successfully

Summary:
  Models tested: 3
  Total benchmarks: 15
  Duration: 87.3s
  Fastest model: gemma3:4b
  Average speed: 31.2 tokens/sec

Detailed Results:
Model               Tokens/sec  First Token Total Time  Memory    Quality
--------------------------------------------------------------------------------
gemma3:4b           35.2        310ms       7234ms      3100MB    98.5
llama3.1:8b         29.1        420ms       8912ms      4700MB    99.2
mistral:7b          28.9        380ms       9156ms      4100MB    97.8
```

## Library Usage

olbench can also be used programmatically:

```ts
import { SystemDetector, ModelTierManager, BenchmarkRunner } from 'olbench';

const detector = new SystemDetector();
const system = await detector.detectSystem();

const runner = new BenchmarkRunner();
const results = await runner.runBenchmark({
  models: ['gemma:2b'],
  prompts: BenchmarkRunner.getDefaultPrompts(),
  iterations: 5,
  concurrency: 1,
  timeout: 300,
  warmupIterations: 1,
});
```

## Documentation

- [User Guide](docs/USER-GUIDE.md) — usage instructions
- [Technical Documentation](docs/TECHNICAL.md) — architecture and internals
- [API Reference](docs/API.md) — library interfaces
- [Examples](docs/EXAMPLES.md) — practical use cases
- [Contributing](docs/CONTRIBUTING.md) — development guide

## Development

```bash
git clone https://github.com/zaakirio/olbench.git
cd olbench
npm install

npm run dev info     # Run from source with tsx
npm run build        # Compile TypeScript to dist/
npm run typecheck    # Type-check without emitting
npm run lint         # Lint sources
npm test             # Run the test suite (node:test)
```

## Contributing

Contributions are welcome. See the [Contributing Guide](docs/CONTRIBUTING.md) for
development setup, code standards, and the pull request process.

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

- [Ollama](https://ollama.com) for the local LLM runtime
- [Commander.js](https://github.com/tj/commander.js/) for the CLI framework
- [chalk](https://github.com/chalk/chalk) for terminal styling
- [systeminformation](https://github.com/sebhildebrandt/systeminformation) for hardware detection

## Roadmap

- [x] Auto-detection of installed models
- [x] Smart download-size estimation
- [x] Hardware-aware model recommendations
- [x] Automated test suite
- [ ] Performance regression detection
- [ ] Plugin system for custom prompt sets and reporters
- [ ] Model performance history tracking
