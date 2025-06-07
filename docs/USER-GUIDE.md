# Ollama Benchmark Tool - User Guide

A comprehensive Node.js-based benchmarking tool for Ollama local LLMs that automatically detects system capabilities and provides intelligent model recommendations.

## 🚀 Quick Start

### Prerequisites
- **Node.js 22+** installed
- **Ollama** installed and running (`ollama serve`)
- At least 4GB RAM (8GB+ recommended)

### Installation
```bash
# Install globally
npm install -g ollama-benchmark-node

# Or run from source
git clone <repository-url>
cd ollama-benchmark-node
npm install
npm run build
```

### First Steps
```bash
# 1. Check your system capabilities
olbench info

# 2. Discover models suitable for your system
olbench discover

# 3. Install a recommended model
ollama pull gemma:2b  # or any model from discover command

# 4. Run your first benchmark
olbench run --models "gemma:2b" --iterations 3
```

## 📋 Commands Overview

### `info` - System Information
Get detailed information about your system and model recommendations.

```bash
# Basic system info
olbench info

# Detailed information with all tiers
olbench info --verbose
```

**Output includes:**
- Operating system and architecture
- Total and available RAM
- RAM tier classification (1-4)
- Ollama installation status and version
- GPU information
- Recommended models for your tier

### `discover` - Model Discovery
Find, search, and manage models available for your system.

```bash
# Show recommendations for your RAM
olbench discover

# Browse models by category
olbench discover --category chat
olbench discover --category code
olbench discover --category reasoning
olbench discover --category vision

# Search for specific models
olbench discover --search llama
olbench discover --search deepseek

# See trending/popular models
olbench discover --trending

# Check installed models
olbench discover --installed

# Install a model directly
olbench discover --pull gemma:2b
```

**Categories:**
- **chat** - General conversation models (llama3.1, mistral, gemma2)
- **code** - Programming and code generation (deepseek-coder, codellama)
- **reasoning** - Advanced reasoning and math (deepseek-r1, qwq)
- **vision** - Image understanding models (llava)

### `run` - Run Benchmarks
Execute performance benchmarks on selected models.

```bash
# Auto-select models based on RAM tier
olbench run

# Test specific models
olbench run --models "gemma:2b,mistral:7b"

# Test all models from a specific tier
olbench run --tier 2

# Customize benchmark parameters
olbench run --models "llama3.1:8b" --iterations 5 --prompts coding

# Save results to file
olbench run --output benchmark-results.html --format html
```

**Available Options:**
- `--models <list>` - Comma-separated list of models to test
- `--tier <1-4>` - Test models from specific RAM tier
- `--iterations <num>` - Number of test runs per model (default: 5)
- `--prompts <type>` - Prompt set: default, coding, creative, reasoning
- `--output <path>` - Save results to file
- `--format <type>` - Output format: json, csv, markdown, html
- `--timeout <seconds>` - Request timeout (default: 300)
- `--warmup <num>` - Warmup iterations (default: 2)
- `--concurrency <num>` - Concurrent requests (default: 1)

### `config` - Configuration Management
Manage benchmark configurations and settings.

```bash
# Generate sample configuration file
olbench config --generate my-config.yml

# Validate configuration file
olbench config --validate my-config.yml

# Show current configuration
olbench config --show
```

## 🎯 RAM Tiers & Model Selection

The tool automatically categorizes your system into RAM tiers and recommends appropriate models:

### Tier 1: 4GB-7GB RAM
**Small, efficient models for basic tasks**
- `deepseek-r1:1.5b` - Lightweight reasoning
- `gemma:2b` - Efficient small model
- `phi:2.7b` - Compact but capable
- `phi3:3.8b` - Enhanced small model

### Tier 2: 8GB-15GB RAM
**Medium models with good performance**
- `phi3:3.8b` - Enhanced small model
- `gemma2:9b` - Balanced performance
- `mistral:7b` - High-performance medium
- `llama3.1:8b` - Latest Llama model
- `deepseek-r1:8b` - Medium reasoning
- `llava:7b` - Vision-language model

### Tier 3: 16GB-31GB RAM
**Large models for advanced tasks**
- `gemma2:9b` - Balanced performance
- `mistral:7b` - High-performance medium
- `phi4:14b` - Advanced reasoning
- `deepseek-r1:8b/14b` - Reasoning models
- `llava:7b/13b` - Vision models

### Tier 4: 32GB+ RAM
**Extra large models for maximum performance**
- `phi4:14b` - Advanced reasoning
- `deepseek-r1:14b` - Large reasoning
- `deepseek-r1:32b` - Extra large reasoning

## 📊 Understanding Benchmark Results

### Performance Metrics
- **Tokens/sec** - Generation speed (higher is better)
- **First Token** - Time to start generating (lower is better)
- **Total Time** - Complete response time (lower is better)
- **Memory** - RAM usage during inference
- **Quality Score** - Response consistency and completion rate

### Result Formats

#### Console Output
```
Detailed Results:
Model               Tokens/sec  First Token Total Time  Memory    Quality
--------------------------------------------------------------------------------
gemma3:4b           29.7        34ms        8696ms      0.2MB     100.0
mistral:7b          35.2        28ms        7234ms      0.3MB     98.5
```

#### JSON Output (`--format json`)
```json
{
  "summary": {
    "totalModels": 2,
    "totalBenchmarks": 10,
    "fastestModel": "mistral:7b",
    "averageTokensPerSecond": 32.45
  },
  "results": [...],
  "systemInfo": {...}
}
```

#### HTML Output (`--format html`)
Rich visual report with:
- Interactive performance charts
- System information summary
- Detailed model comparisons
- Beautiful styling and graphs

## 🔧 Configuration Files

### Default Configuration
Located at `config/default.yml`, contains:
- Benchmark settings (timeout, iterations)
- RAM tier definitions
- Prompt sets for different use cases
- Output preferences

### Custom Configuration
```yaml
version: "1.0.0"
benchmark:
  timeout: 300
  iterations: 5
  concurrency: 1
  warmupIterations: 2

prompts:
  custom:
    - "Your custom prompt 1"
    - "Your custom prompt 2"

output:
  formats: ["json", "html"]
  directory: "./my-results"
```

Use with: `olbench run --config my-config.yml`

## 💡 Best Practices

### Before Benchmarking
1. **Check system info** - Ensure adequate RAM and Ollama is running
2. **Discover models** - Find models suitable for your system
3. **Start small** - Test with 1-2 models and few iterations first
4. **Choose appropriate prompts** - Use coding prompts for code models

### During Benchmarking
- **Close other applications** - Free up RAM for accurate results
- **Use warmup iterations** - Ensures consistent performance measurement
- **Monitor system resources** - Watch for memory or thermal throttling

### Result Analysis
- **Compare similar-sized models** - 7B vs 7B models for fair comparison
- **Consider use case** - High tokens/sec for chat, low latency for real-time
- **Save results** - Keep benchmarks for future comparisons

## 🔍 Troubleshooting

### Common Issues

**Ollama not detected**
```bash
# Check if Ollama is running
ollama list

# Start Ollama if needed
ollama serve
```

**Model not found**
```bash
# Check available models
olbench discover --installed

# Pull missing model
ollama pull model-name
```

**Out of memory errors**
- Use smaller models for your RAM tier
- Close other applications
- Check available RAM with `olbench info`

**Slow benchmarks**
- Reduce iterations for quick tests
- Use smaller models
- Check system load

### Getting Help
- Run `olbench --help` for command overview
- Check `olbench discover` for model recommendations
- Use `olbench info --verbose` for detailed system analysis

## 🚀 Advanced Usage

### Batch Benchmarking
```bash
# Test multiple model categories
olbench run --models "llama3.1:8b,deepseek-coder:6.7b,llava:7b"

# Compare different prompt types
olbench run --models "deepseek-coder:6.7b" --prompts coding
olbench run --models "deepseek-coder:6.7b" --prompts default
```

### Automated Testing
```bash
# Quick performance check
olbench run --iterations 2 --output quick-test.json

# Comprehensive benchmark
olbench run --tier 3 --iterations 10 --output full-benchmark.html
```

### Integration
The tool can be integrated into CI/CD pipelines or automated testing workflows using the JSON output format and exit codes.

---

**Need more help?** Check the [Technical Documentation](TECHNICAL.md) for advanced configuration and API details.