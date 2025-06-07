# olbench 🚀

**Comprehensive Node.js-based benchmarking tool for Ollama local LLMs**

[![npm version](https://badge.fury.io/js/olbench.svg)](https://www.npmjs.com/package/olbench)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Automatically detects your system capabilities, discovers installed models, and provides detailed performance benchmarks for Ollama local LLMs with smart download size estimation.

## ✨ Features

- 🖥️ **Smart System Detection** - Automatically detects RAM, GPUs, and OS
- 🎯 **Intelligent Model Recommendations** - RAM-based tier system (4-64GB+)
- 📊 **Comprehensive Benchmarking** - Tokens/sec, latency, memory, quality metrics
- 🔍 **Auto-Model Discovery** - Detects installed models, estimates download sizes
- 📁 **Multiple Output Formats** - JSON, CSV, Markdown, HTML reports
- ⚙️ **Flexible Configuration** - YAML config files with CLI overrides
- 🎨 **Beautiful CLI** - Colored output with progress indicators
- 📏 **Smart Size Tracking** - Real sizes for installed, estimates for missing models

## 🚀 Quick Start

### Installation

```bash
npm install -g olbench
```

### Basic Usage

```bash
# Check your system capabilities
olbench info

# Discover models for your system
olbench discover

# Install a model (using Ollama)
ollama pull gemma:2b

# Run benchmarks
olbench run --models "gemma:2b" --iterations 5
```

## 📋 Commands

### `olbench info`
Display system information and model recommendations

```bash
olbench info                # Basic system info
olbench info --verbose      # Detailed information
```

### `olbench discover`
Explore and manage available models

```bash
olbench discover                        # Recommendations for your RAM
olbench discover --category code        # Filter by category
olbench discover --search "llama"       # Search models
olbench discover --trending             # Popular models
olbench discover --installed            # Show installed models
olbench discover --size "llama3.1:8b"  # Check download size
olbench discover --pull "gemma:2b"      # Install a model
```

### `olbench run`
Execute benchmark tests

```bash
olbench run                                    # Auto-select models
olbench run --models "gemma:2b,phi3:3.8b"     # Specific models
olbench run --tier 2                          # Test tier 2 models
olbench run --iterations 10                   # More iterations
olbench run --output results.json             # Save results
olbench run --format markdown                 # Different format
olbench run --prompts coding                  # Specific prompt set
```

### `olbench config`
Manage configuration

```bash
olbench config --generate config.yaml    # Create sample config
olbench config --validate config.yaml    # Validate config
olbench config --show                    # Show current config
```

## 📊 Example Output

### System Information
```
🚀 olbench - Ollama Benchmark Tool

🖥️  System Information
• Operating System: macOS (arm64)
• Total RAM: 24GB
• RAM Tier: Tier 3 (Performance Tier)
• Ollama: ✅ Running (v0.9.0)

📊 Recommendations for 24GB RAM:
💡 Recommended to Install:
• llama3.1:8b - Meta Llama 3.1 8B | Download: 4.7GB
• deepseek-coder:6.7b - DeepSeek Coder 6.7B | Download: 3.8GB
• gemma2:9b - Google Gemma 2 9B | Download: 5.4GB
```

### Smart Model Detection
```
✅ Configuration loaded
  Models to test: gemma3:4b, llama3.1:8b, mistral:7b
  Iterations: 5
  Prompts: 1
  Already installed: 1 models
    • gemma3:4b: 3.1GB
  Need to download: 2 models (8.8GB)
    • llama3.1:8b: 4.7GB
    • mistral:7b: 4.1GB
```

### Benchmark Results
```
🎉 Benchmark completed successfully!

Summary:
• Models tested: 3
• Total benchmarks: 15
• Duration: 87.3s
• Fastest model: gemma3:4b
• Average speed: 31.2 tokens/sec

Detailed Results:
Model               Tokens/sec  First Token Total Time  Memory    Quality
--------------------------------------------------------------------------------
gemma3:4b           35.2        28ms        7234ms      3.1GB     98.5
llama3.1:8b         29.1        45ms        8912ms      4.7GB     99.2
mistral:7b          28.9        38ms        9156ms      4.1GB     97.8
```

## 🤖 Auto-Detection Features

olbench intelligently detects your system and models to provide accurate information:

### 📦 Model Detection
- **Scans installed models** via Ollama API (`/api/tags`)
- **Shows real file sizes** for installed models
- **Estimates download sizes** for missing models using:
  - Database lookup for popular models
  - Pattern-based estimation (e.g., `gemma3:4b` → ~2.5GB)
  - Smart fallbacks for unknown models

### 💾 Size Reporting
```bash
# Shows only what you actually need to download
olbench run --models "installed:model,missing:model" --verbose

# Output:
  Already installed: 1 models
    • installed:model: 3.1GB
  Need to download: 1 models (4.7GB)
    • missing:model: 4.7GB
```

### 🎯 Benefits
- **No manual database maintenance** - works with any Ollama model
- **Accurate resource planning** - know exactly what bandwidth/storage you need
- **Works offline** - once models are installed, no internet required for detection

## ⚙️ Configuration

Create a `config.yaml` file for persistent settings:

```yaml
models:
  - "llama3.1:8b"
  - "gemma:2b"

benchmark:
  iterations: 5
  concurrency: 1
  timeout: 30
  warmupIterations: 1

prompts:
  - "default"
  - "coding"

output:
  format: "json"
  includeSystemInfo: true
  prettify: true
```

## 🎯 RAM Tiers

| Tier | RAM Range | Recommended Models | Use Case |
|------|-----------|-------------------|----------|
| **Tier 1** | 4-7GB | gemma:2b, phi:2.7b | Basic tasks, testing |
| **Tier 2** | 8-15GB | llama3.1:8b, mistral:7b | General purpose |
| **Tier 3** | 16-31GB | gemma2:9b, deepseek-r1:14b | Performance |
| **Tier 4** | 32GB+ | qwq:32b, llama3.1:70b | High-end tasks |

## 📚 Documentation

- [📖 User Guide](docs/USER-GUIDE.md) - Comprehensive usage instructions
- [🔧 Technical Documentation](docs/TECHNICAL.md) - Architecture and internals
- [📋 API Reference](docs/API.md) - Library usage and interfaces
- [💡 Examples](docs/EXAMPLES.md) - Practical use cases and scripts
- [🤝 Contributing](docs/CONTRIBUTING.md) - Development and contribution guide

## 🛠️ Requirements

- **Node.js 22+** (for native fetch and ESM support)
- **Ollama** installed and running
- **4GB+ RAM** (8GB+ recommended)

## 📦 Development

```bash
git clone https://github.com/username/olbench.git
cd olbench
npm install
npm run build

# Development commands
npm run dev info           # Run with hot reload
npm run typecheck         # Type checking
npm run lint              # Code linting
npm run format            # Code formatting
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/CONTRIBUTING.md) for details on:

- Development setup
- Code standards
- Testing guidelines
- Pull request process

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) for the excellent local LLM platform
- [Commander.js](https://github.com/tj/commander.js/) for CLI framework
- [Chalk](https://github.com/chalk/chalk) for terminal styling
- [systeminformation](https://github.com/sebhildebrandt/systeminformation) for system detection

## 📈 Roadmap

- [x] ~~Auto-detection of installed models~~ ✅ **Completed**
- [x] ~~Smart download size estimation~~ ✅ **Completed**
- [ ] Automated testing suite
- [ ] Performance regression detection
- [ ] React/Ink UI (when compatibility improves)
- [ ] Plugin system for extensions
- [ ] Cloud model comparison
- [ ] Real-time monitoring dashboard
- [ ] Model performance history tracking
- [ ] Batch model comparison reports

---

**Made with ❤️ for the Ollama community**