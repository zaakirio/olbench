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
