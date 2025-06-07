# [1.1.0](https://github.com/zaakirio/olbench/compare/v1.0.0...v1.1.0) (2025-06-07)


### Features

* **modules:** Adjusted modules to check for local model before download ([cb8e0e2](https://github.com/zaakirio/olbench/commit/cb8e0e2cbd2deea35390689559e92b13d6f0236e))

# 1.0.0 (2025-06-07)


### Features

* **config:** Added config ([17e9812](https://github.com/zaakirio/olbench/commit/17e98126a50785c8b5e28a1b6afc57aa24e1fc69))
* **docs:** Added documentation and workflows ([640dc25](https://github.com/zaakirio/olbench/commit/640dc25bc4a2e80fcd30e85d53e2333da7ba7207))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Auto-detection of installed Ollama models via API
- Smart download size estimation using real file sizes for installed models
- Pattern-based size estimation for unknown models (e.g., `gemma3:4b` → ~2.5GB)
- Detailed verbose output showing installed vs missing models
- Enhanced CLI output with accurate download requirements

### Fixed
- Bug where download estimates were shown for already installed models
- Improved model detection reliability using `/api/tags` endpoint

### Changed
- Model discovery now dynamically detects installed models instead of relying on static database
- Size reporting shows actual disk usage for installed models
- Download estimates only shown for models that actually need downloading

## [1.0.0] - 2025-01-07

### Added
- Initial release of olbench (Ollama Benchmark Tool)
- Comprehensive system detection with RAM, GPU, and OS information
- RAM-based model tier system (Tier 1-4) for automatic model recommendations
- Model discovery system with 16+ popular models across categories
- Download size estimation for models
- Benchmark runner with configurable iterations, concurrency, and timeouts
- Multiple output formats: JSON, CSV, Markdown, HTML
- Interactive CLI with colored output using chalk
- YAML configuration file support
- Four main commands:
  - `olbench info` - System information and model recommendations
  - `olbench discover` - Model discovery and management
  - `olbench run` - Execute benchmarks
  - `olbench config` - Configuration management
- Model categories: chat, code, vision, reasoning
- Performance metrics: tokens/sec, latency, memory usage, quality scores
- Comprehensive documentation suite
- TypeScript implementation with Node.js 22+ support

### Technical Features
- ESM module support with native fetch API
- Automatic Ollama installation detection
- Cross-platform compatibility (macOS, Windows, Linux)
- Memory-aware model recommendations
- Real-time benchmark progress reporting
- Error handling and validation
- CLI argument parsing with commander.js

[Unreleased]: https://github.com/username/olbench/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/username/olbench/releases/tag/v1.0.0
