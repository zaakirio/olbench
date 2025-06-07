# Ollama Benchmark Tool - Node.js

A comprehensive Node.js-based benchmarking tool for Ollama local LLMs that automatically detects system RAM and runs appropriate model benchmarks.

## Features

- **Automatic System Detection**: Detects RAM, OS, and GPU information
- **RAM-Based Model Tiers**: Automatically selects appropriate models based on available RAM
- **Performance Metrics**: Measures throughput, latency, and memory usage
- **Multiple Output Formats**: JSON, CSV, Markdown reports
- **Interactive CLI**: Rich terminal UI with progress indicators
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Installation

```bash
npm install -g ollama-benchmark-node
```

## Quick Start

```bash
# Run benchmark with auto-detected configuration
olbench run

# Run benchmark for specific models
olbench run --models "llama3.1:8b,mistral:7b"

# Use custom configuration
olbench run --config ./custom-benchmark.yml

# View system information
olbench info
```

## RAM Tiers

The tool automatically selects models based on available system RAM:

- **Tier 1 (4GB-7GB)**: Small models like deepseek-r1:1.5b, gemma:2b
- **Tier 2 (8GB-15GB)**: Medium models like mistral:7b, llama3.1:8b
- **Tier 3 (16GB-31GB)**: Larger models like phi4:14b, llava:13b
- **Tier 4 (32GB+)**: Large models like deepseek-r1:32b

## Requirements

- Node.js 22.0.0 or higher
- Ollama installed and running
- Sufficient RAM for chosen model tier (4GB minimum, 8GB+ recommended)

## 📚 Documentation

### Quick Links
- **[User Guide](docs/USER-GUIDE.md)** - Complete usage instructions and examples
- **[API Reference](docs/API.md)** - Library API documentation  
- **[Technical Docs](docs/TECHNICAL.md)** - Architecture and development details
- **[Examples](docs/EXAMPLES.md)** - Practical use cases and workflows

### Getting Started
1. **First time?** Start with the [User Guide](docs/USER-GUIDE.md)
2. **Using as library?** Check the [API Reference](docs/API.md)
3. **Want examples?** Browse [Examples](docs/EXAMPLES.md)
4. **Contributing?** See [Technical Documentation](docs/TECHNICAL.md)

## 🚀 Quick Start

```bash
# Check your system capabilities
olbench info

# Discover models suitable for your system  
olbench discover

# Install a recommended model
ollama pull gemma:2b

# Run your first benchmark
olbench run --models "gemma:2b" --iterations 3

# Generate detailed HTML report
olbench run --output results.html --format html
```

## 🔍 Model Discovery

The tool intelligently discovers and recommends models:

```bash
# See what's recommended for your RAM
olbench discover

# Browse by category (chat, code, reasoning, vision)
olbench discover --category code

# Search for specific models
olbench discover --search llama

# See trending models
olbench discover --trending
```

## 📊 Advanced Features

- **Smart RAM Detection** - Automatically selects appropriate models
- **Model Discovery** - Find popular models by category
- **Multiple Output Formats** - JSON, CSV, Markdown, HTML reports
- **Performance Metrics** - Throughput, latency, memory, quality analysis
- **Comparison Tools** - Compare different models and benchmark runs
- **Rich CLI Interface** - Beautiful terminal output with progress indicators

## License

MIT