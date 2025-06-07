# olbench 🚀

**Comprehensive Node.js-based benchmarking tool for Ollama local LLMs**

[![npm version](https://badge.fury.io/js/olbench.svg)](https://www.npmjs.com/package/olbench)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Automatically detects your system capabilities, recommends optimal models, and provides detailed performance benchmarks for Ollama local LLMs.

## ✨ Features

- 🖥️ **Smart System Detection** - Automatically detects RAM, GPUs, and OS
- 🎯 **Intelligent Model Recommendations** - RAM-based tier system (4-64GB+)
- 📊 **Comprehensive Benchmarking** - Tokens/sec, latency, memory, quality metrics
- 🔍 **Model Discovery** - 16+ popular models across chat, code, vision, reasoning
- 📁 **Multiple Output Formats** - JSON, CSV, Markdown, HTML reports
- ⚙️ **Flexible Configuration** - YAML config files with CLI overrides
- 🎨 **Beautiful CLI** - Colored output with progress indicators
- 📏 **Download Size Tracking** - Know bandwidth/storage requirements

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

```
🚀 olbench - Ollama Benchmark Tool

🖥️  System Information
• Operating System: macOS (arm64)
• Total RAM: 16GB
• RAM Tier: Tier 3 (Performance Tier)
• Ollama: ✅ Running (v0.1.17)

📊 Recommendations for 16GB RAM:
💡 Recommended to Install:
• llama3.1:8b - Meta Llama 3.1 8B | Download: 4.7GB
• deepseek-coder:6.7b - DeepSeek Coder 6.7B | Download: 3.8GB
• gemma2:9b - Google Gemma 2 9B | Download: 5.4GB
```

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

- [ ] Automated testing suite
- [ ] Performance regression detection
- [ ] React/Ink UI (when compatibility improves)
- [ ] Plugin system for extensions
- [ ] Cloud model comparison
- [ ] Real-time monitoring dashboard

---

**Made with ❤️ for the Ollama community**