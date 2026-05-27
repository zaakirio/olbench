#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { SystemDetector } from './modules/system-detection.js';
import { ModelTierManager } from './modules/model-tiers.js';
import { BenchmarkRunner } from './modules/benchmark-runner.js';
import { ResultsProcessor } from './modules/results-processor.js';
import { ConfigManager } from './modules/config-manager.js';
import { ReportGenerator } from './modules/report-generator.js';
import { ModelDiscovery } from './modules/model-discovery.js';
import { VERSION } from './modules/version.js';

const program = new Command();

program
  .name('olbench')
  .description('Comprehensive Node.js-based benchmarking tool for Ollama local LLMs')
  .version(VERSION);

program
  .command('info')
  .description('Display system information and available models')
  .option('-v, --verbose', 'Show detailed information')
  .action(async (options) => {
    try {
      console.log(chalk.blue.bold('System Information\n'));

      const detector = new SystemDetector();
      const systemInfo = await detector.detectSystem();
      const tierManager = new ModelTierManager();
      const ramTier = detector.getRAMTier(systemInfo.totalRAM);
      const tier = tierManager.getAllTiers().find(t => t.priority === ramTier);

      // Get hardware score and hardware-aware recommendations
      const hwScore = detector.getHardwareScore(systemInfo);
      const recommendedModels = tierManager.getHardwareAwareRecommendations({
        availableRAM: systemInfo.availableRAM,
        totalRAM: systemInfo.totalRAM,
        hasGPU: hwScore.hasGPU,
        hasCUDA: hwScore.hasCUDA,
        architecture: systemInfo.architecture,
        os: systemInfo.os,
      }, 5);

      console.log(chalk.cyan('Basic Information:'));
      console.log(`  Operating System: ${chalk.green(systemInfo.os)} (${systemInfo.architecture})`);
      console.log(`  CPU: ${chalk.green(systemInfo.cpu.brand)} (${systemInfo.cpu.physicalCores} cores @ ${systemInfo.cpu.speed}GHz)`);
      console.log(`  Total RAM: ${chalk.green(systemInfo.totalRAM + 'GB')}`);
      console.log(`  Available RAM: ${chalk.green(systemInfo.availableRAM + 'GB')} (${hwScore.effectiveRAM}GB effective)`);
      console.log(`  RAM Tier: ${chalk.yellow(tier ? tier.name : 'Tier ' + ramTier)}`);
      console.log(`  Hardware Score: ${chalk.yellow(hwScore.score.toFixed(1) + '/100')} (CPU: ${hwScore.cpuScore.toFixed(1)}, GPU: ${hwScore.gpuScore.toFixed(1)})`);
      console.log();

      console.log(chalk.cyan('Ollama Status:'));
      console.log(`  Status: ${systemInfo.ollamaAvailable ? chalk.green('Running') : chalk.red('Not detected')}`);
      if (systemInfo.ollamaVersion) {
        console.log(`  Version: ${chalk.green('v' + systemInfo.ollamaVersion)}`);
      }
      console.log();

      if (systemInfo.gpus.length > 0) {
        console.log(chalk.cyan('Graphics Cards:'));
        systemInfo.gpus.forEach((gpu) => {
          let gpuInfo = `  ${gpu.vendor} ${gpu.model}`;
          if (gpu.vram > 0) {
            gpuInfo += chalk.green(` (${gpu.vram}MB VRAM)`);
          }
          if (gpu.cudaAvailable) {
            gpuInfo += chalk.yellow(` [CUDA ${gpu.computeCapability}]`);
          }
          console.log(gpuInfo);
        });
        console.log();
      }

      console.log(chalk.cyan('Hardware-Aware Recommendations:'));
      if (recommendedModels.length > 0) {
        recommendedModels.forEach((model, index) => {
          let modelInfo = `  ${index + 1}. ${chalk.blue(model.name)}`;
          if (model.description) {
            modelInfo += chalk.gray(' - ' + model.description);
          }
          console.log(modelInfo);
          let details = `     Memory: ${model.memoryRequirement}GB`;
          if (model.gpuOptimized && model.cpuOptimized) {
            details += ' | GPU+CPU optimized';
          } else if (model.gpuOptimized) {
            details += ' | GPU optimized';
          } else if (model.cpuOptimized) {
            details += ' | CPU optimized';
          }
          console.log(chalk.gray(details));
        });
      } else {
        console.log(chalk.red('  No recommended models for your system'));
      }
      console.log();

      if (options.verbose && tier) {
        console.log(chalk.cyan('All Models in Your Tier:'));
        tier.models.forEach((model) => {
          console.log(`  ${chalk.cyan(model.name)} (Priority: ${model.priority})${model.description ? chalk.gray(' - ' + model.description) : ''}`);
        });
        console.log();
      }

      if (options.verbose) {
        console.log(chalk.cyan('All Available Tiers:'));
        tierManager.getAllTiers().forEach((t) => {
          console.log(chalk.yellow(`${t.name}:`));
          console.log(`  RAM Range: ${t.ramRange[0]}GB - ${t.ramRange[1] === Infinity ? 'unlimited' : t.ramRange[1] + 'GB'}`);
          console.log(`  Models: ${t.models.length}`);
        });
      }

    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('run')
  .description('Run benchmark tests')
  .option('-m, --models <models>', 'Comma-separated list of models to test')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-t, --tier <number>', 'Specific RAM tier to test (1-4)', parseInt)
  .option('-o, --output <path>', 'Output file path')
  .option('-f, --format <format>', 'Output format (json, csv, markdown, html)', 'json')
  .option('-i, --iterations <number>', 'Number of benchmark iterations', parseInt)
  .option('--concurrency <number>', 'Number of concurrent requests', parseInt)
  .option('--timeout <seconds>', 'Timeout per request in seconds', parseInt)
  .option('-p, --prompts <type>', 'Prompt set to use (default, coding, creative, reasoning)', 'default')
  .option('-v, --verbose', 'Verbose output')
  .option('-w, --warmup <number>', 'Number of warmup iterations', parseInt)
  .action(async (options) => {
    try {
      console.log(chalk.blue.bold('Running Ollama Benchmark\n'));

      // System detection
      console.log(chalk.yellow('Detecting system configuration...'));
      const detector = new SystemDetector();
      const systemInfo = await detector.detectSystem();

      if (!systemInfo.ollamaAvailable) {
        throw new Error('Ollama is not running. Please start Ollama and try again.');
      }

      console.log(chalk.green('System detected:'));
      console.log(`  OS: ${systemInfo.os} (${systemInfo.architecture})`);
      console.log(`  RAM: ${systemInfo.totalRAM}GB total, ${systemInfo.availableRAM}GB available`);
      console.log(`  Ollama: v${systemInfo.ollamaVersion}`);
      console.log();

      // Load configuration
      console.log(chalk.yellow('Loading configuration...'));
      const configManager = new ConfigManager();
      await configManager.loadConfig(options.config);

      const cliOptions = {
        ...options,
        models: options.models ? options.models.split(',').map((m: string) => m.trim()) : undefined,
        prompts: options.prompts ? [options.prompts] : undefined,
      };
      const benchmarkConfig = configManager.applyCommandLineOverrides(cliOptions);

      // Determine models to test
      let modelsToTest = benchmarkConfig.models;
      if (!modelsToTest || modelsToTest.length === 0) {
        const tierManager = new ModelTierManager();
        if (options.tier) {
          const tier = tierManager.getAllTiers().find(t => t.priority === options.tier);
          if (tier) {
            modelsToTest = tier.models.slice(0, 3).map(m => m.name);
          } else {
            throw new Error(`Invalid tier: ${options.tier}`);
          }
        } else {
          // Use hardware-aware recommendations
          const hwScore = detector.getHardwareScore(systemInfo);
          const recommendedModels = tierManager.getHardwareAwareRecommendations({
            availableRAM: systemInfo.availableRAM,
            totalRAM: systemInfo.totalRAM,
            hasGPU: hwScore.hasGPU,
            hasCUDA: hwScore.hasCUDA,
            architecture: systemInfo.architecture,
            os: systemInfo.os,
          });
          modelsToTest = recommendedModels.map(m => m.name);
        }
      }

      if (modelsToTest.length === 0) {
        console.log(chalk.red('No models available to test.'));
        console.log(chalk.yellow('Suggestions:'));
        console.log(`  Run ${chalk.cyan('olbench discover')} to see recommended models`);
        console.log(`  Install a model: ${chalk.cyan('ollama pull gemma:2b')}`);
        console.log(`  Or specify models manually: ${chalk.cyan('--models "gemma:2b"')}`);
        process.exit(1);
      }

      console.log(chalk.green('Configuration loaded'));
      console.log(`  Models to test: ${Array.isArray(modelsToTest) ? modelsToTest.join(', ') : modelsToTest}`);
      console.log(`  Iterations: ${benchmarkConfig.iterations}`);
      console.log(`  Prompts: ${benchmarkConfig.prompts.length}`);

      // Show download size estimation for missing models only
      if (Array.isArray(modelsToTest)) {
        const discovery = new ModelDiscovery();
        const sizeInfo = await discovery.calculateDownloadSizeForMissingModels(modelsToTest);

        if (sizeInfo.installedCount > 0) {
          console.log(`  Already installed: ${sizeInfo.installedCount} models`);

          // Show installed model sizes for reference
          if (options.verbose) {
            const installedModels = sizeInfo.breakdown.filter(m => m.isInstalled);
            installedModels.forEach(model => {
              console.log(`    ${model.name}: ${discovery.formatSizeInfo(model.actualSizeGB || 0)}`);
            });
          }
        }

        if (sizeInfo.missingCount > 0) {
          if (sizeInfo.totalDownloadGB > 0) {
            console.log(`  Need to download: ${sizeInfo.missingCount} models (${discovery.formatSizeInfo(sizeInfo.totalDownloadGB)})`);

            // Show what needs to be downloaded
            if (options.verbose) {
              const missingModels = sizeInfo.breakdown.filter(m => !m.isInstalled && m.downloadGB > 0);
              missingModels.forEach(model => {
                console.log(`    ${model.name}: ${discovery.formatSizeInfo(model.downloadGB)}`);
              });
            }
          } else {
            console.log(`  Need to download: ${sizeInfo.missingCount} models (sizes unknown)`);
          }
        }
      }
      console.log();

      // Run benchmarks
      console.log(chalk.yellow(`Running benchmarks for ${modelsToTest.length} models...`));
      console.log(chalk.gray('This may take several minutes depending on the models and iterations.'));
      console.log();

      const runner = new BenchmarkRunner();
      benchmarkConfig.models = modelsToTest;

      const startTime = new Date();

      if (options.verbose) {
        console.log(chalk.gray(`  Models: ${modelsToTest.join(', ')}`));
        console.log(chalk.gray(`  Started at: ${startTime.toLocaleTimeString()}`));
      }

      const modelResults = await runner.runBenchmark(benchmarkConfig);

      // Process results
      console.log(chalk.yellow('\nProcessing results...'));
      const processor = new ResultsProcessor();
      const report = processor.processBenchmarkResults(modelResults, systemInfo, startTime, benchmarkConfig);

      console.log(chalk.green.bold('\nBenchmark completed successfully\n'));

      // Display summary
      console.log(chalk.blue.bold('Summary:'));
      console.log(`  Models tested: ${report.summary.totalModels}`);
      console.log(`  Total benchmarks: ${report.summary.totalBenchmarks}`);
      console.log(`  Duration: ${(report.metadata.duration / 1000).toFixed(1)}s`);
      console.log(`  Fastest model: ${chalk.green(report.summary.fastestModel)}`);
      console.log(`  Average speed: ${report.summary.averageTokensPerSecond.toFixed(1)} tokens/sec`);
      console.log();

      // Display results table
      console.log(chalk.blue.bold('Detailed Results:'));
      console.log(chalk.gray('Model'.padEnd(20) + 'Tokens/sec'.padEnd(12) + 'First Token'.padEnd(12) + 'Total Time'.padEnd(12) + 'Memory'.padEnd(10) + 'Quality'));
      console.log(chalk.gray('-'.repeat(80)));

      report.results.forEach(result => {
        const qualityScore = (result.quality.consistency * result.quality.completionRate / 100).toFixed(1);
        console.log(
          result.model.padEnd(20) +
          result.tokensPerSecond.toFixed(1).padEnd(12) +
          (result.firstTokenLatency.toFixed(0) + 'ms').padEnd(12) +
          (result.totalLatency.toFixed(0) + 'ms').padEnd(12) +
          (result.memoryUsage.averageMemoryUsage.toFixed(0) + 'MB').padEnd(10) +
          qualityScore
        );
      });
      console.log();

      // Save results if output path specified
      if (options.output) {
        const reportGenerator = new ReportGenerator();
        const format = options.format as any || 'json';
        await reportGenerator.generateReport(report, {
          format,
          outputPath: options.output,
          includeRawData: false,
          includeSystemInfo: true,
          prettify: true,
        });
        console.log(chalk.green(`Results saved to: ${options.output}`));
      }

    } catch (error) {
      console.error(chalk.red('Benchmark failed:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('discover')
  .description('Discover and manage available models')
  .option('-c, --category <type>', 'Filter by category (chat, code, vision, reasoning)')
  .option('-s, --search <query>', 'Search models by name or description')
  .option('--trending', 'Show trending models')
  .option('--pull <model>', 'Pull a specific model')
  .option('--installed', 'Show only installed models')
  .option('--size <models>', 'Show download size for specific models (comma-separated)')
  .action(async (options) => {
    try {
      const discovery = new ModelDiscovery();
      const detector = new SystemDetector();
      const systemInfo = await detector.detectSystem();

      if (options.pull) {
        console.log(chalk.yellow(`Pulling model: ${options.pull}...`));
        console.log(chalk.gray('This may take several minutes depending on the model size.'));
        await discovery.pullModel(options.pull);
        console.log(chalk.green(`Successfully pulled: ${options.pull}`));
        return;
      }

      if (options.size) {
        const models = options.size.split(',').map((m: string) => m.trim());
        const sizeInfo = discovery.calculateTotalDownloadSize(models);

        console.log(chalk.cyan('Download Size Information:'));

        if (sizeInfo.breakdown.length === 0) {
          console.log(chalk.gray('No size information available for these models.'));
        } else {
          sizeInfo.breakdown.forEach(item => {
            console.log(`  ${chalk.blue(item.name)}: ${discovery.formatSizeInfo(item.downloadGB)}`);
          });

          if (sizeInfo.breakdown.length > 1) {
            console.log(`\n${chalk.yellow('Total download:')} ${discovery.formatSizeInfo(sizeInfo.totalDownloadGB)}`);
            console.log(`${chalk.yellow('Total disk space:')} ${discovery.formatSizeInfo(sizeInfo.totalDiskGB)}`);
          }
        }

        console.log();
        return;
      }

      console.log(chalk.blue.bold('Model Discovery\n'));

      if (options.search) {
        const results = discovery.searchModels(options.search);
        console.log(chalk.cyan(`Search Results for "${options.search}":`));
        if (results.length === 0) {
          console.log(chalk.gray('No models found matching your search.'));
        } else {
          results.forEach(model => {
            const ramInfo = model.minRAM <= systemInfo.totalRAM ? chalk.green('Compatible') : chalk.red('Needs more RAM');
            const downloadSize = model.downloadSizeGB !== undefined ? ` | Download: ${discovery.formatSizeInfo(model.downloadSizeGB)}` : '';
            console.log(`  ${chalk.blue(model.name)} - ${model.description}`);
            console.log(`    Category: ${model.category} | RAM: ${model.minRAM}GB+${downloadSize} | ${ramInfo}`);
          });
        }
        console.log();
        return;
      }

      if (options.installed) {
        const installed = await discovery.getInstalledModels();
        console.log(chalk.cyan('Installed Models:'));
        if (installed.length === 0) {
          console.log(chalk.gray('No models installed. Use --pull <model> to install models.'));
        } else {
          installed.forEach(model => {
            console.log(`  ${chalk.blue(model.name)} (${model.parameterSize})`);
            console.log(`    Family: ${model.family} | Size: ${model.sizeGB.toFixed(1)}GB | Quantization: ${model.quantization}`);
          });
        }
        console.log();
        return;
      }

      if (options.trending) {
        const trending = discovery.getTrendingModels();
        console.log(chalk.cyan('Trending Models:'));
        trending.forEach((model, index) => {
          const ramInfo = model.minRAM <= systemInfo.totalRAM ? chalk.green('[compatible]') : chalk.red('[needs more RAM]');
          const downloadSize = model.downloadSizeGB !== undefined ? ` | Download: ${discovery.formatSizeInfo(model.downloadSizeGB)}` : '';
          console.log(`  ${index + 1}. ${chalk.blue(model.name)} ${ramInfo}`);
          console.log(`     ${model.description}`);
          console.log(`     Category: ${model.category} | RAM: ${model.minRAM}GB+ | Popularity: ${model.popularity}%${downloadSize}`);
        });
        console.log();
        return;
      }

      // Default: Show recommendations for user's RAM
      const recommendations = await discovery.getModelRecommendations(systemInfo.totalRAM);

      console.log(chalk.cyan(`Recommendations for ${systemInfo.totalRAM}GB RAM:\n`));

      if (recommendations.installed.length > 0) {
        console.log(chalk.green('Already Installed:'));
        recommendations.installed.forEach(model => {
          console.log(`  ${chalk.blue(model.name)} (${model.parameterSize}) - ${model.sizeGB.toFixed(1)}GB`);
        });
        console.log();
      }

      if (recommendations.canInstall.length > 0) {
        console.log(chalk.yellow('Recommended to Install:'));
        recommendations.canInstall.forEach(model => {
          const downloadSize = model.downloadSizeGB !== undefined ? ` | Download: ${discovery.formatSizeInfo(model.downloadSizeGB)}` : '';
          console.log(`  ${chalk.blue(model.name)} - ${model.description}`);
          console.log(`    Category: ${model.category} | RAM: ${model.minRAM}GB+ | Popularity: ${model.popularity}%${downloadSize}`);
          console.log(chalk.gray(`    Pull: ollama pull ${model.name}`));
        });
        console.log();
      }

      // Show by category
      if (options.category) {
        const categoryModels = discovery.getPopularModels(options.category as any);
        console.log(chalk.cyan(`${options.category.charAt(0).toUpperCase() + options.category.slice(1)} Models:`));
        categoryModels.forEach(model => {
          const ramInfo = model.minRAM <= systemInfo.totalRAM ? chalk.green('[compatible]') : chalk.red('[needs more RAM]');
          const downloadSize = model.downloadSizeGB !== undefined ? ` | Download: ${discovery.formatSizeInfo(model.downloadSizeGB)}` : '';
          console.log(`  ${chalk.blue(model.name)} ${ramInfo} - ${model.description}`);
          console.log(`    RAM: ${model.minRAM}GB+ | Popularity: ${model.popularity}%${downloadSize}`);
        });
      } else {
        console.log(chalk.cyan('Browse by Category:'));
        console.log(`  ${chalk.blue('chat')} - General conversation models`);
        console.log(`  ${chalk.blue('code')} - Programming and code generation`);
        console.log(`  ${chalk.blue('reasoning')} - Advanced reasoning and math`);
        console.log(`  ${chalk.blue('vision')} - Image understanding models`);
        console.log();
        console.log(chalk.gray('Use --category <type> to see models in each category'));
      }

      console.log(chalk.gray('\nCommands:'));
      console.log(chalk.gray('  --search <query>    Search for models'));
      console.log(chalk.gray('  --category <type>   Filter by category'));
      console.log(chalk.gray('  --trending          Show popular models'));
      console.log(chalk.gray('  --installed         Show installed models'));
      console.log(chalk.gray('  --pull <model>      Install a model'));
      console.log(chalk.gray('  --size <models>     Show download sizes'));

    } catch (error) {
      console.error(chalk.red('Discovery failed:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Configuration management')
  .option('-g, --generate <path>', 'Generate sample configuration file')
  .option('-v, --validate <path>', 'Validate configuration file')
  .option('-s, --show', 'Show current configuration')
  .action(async (options) => {
    try {
      const manager = new ConfigManager();

      if (options.generate) {
        await manager.generateSampleConfig(options.generate);
        console.log(chalk.green(`Sample configuration generated at: ${options.generate}`));
      } else if (options.validate) {
        await manager.loadConfig(options.validate);
        const config = manager.getConfig();
        const validation = manager.validateConfig(config);

        if (validation.valid) {
          console.log(chalk.green(`Configuration is valid: ${options.validate}`));
        } else {
          console.log(chalk.red(`Configuration validation failed:`));
          validation.errors.forEach(error => console.log(chalk.red(`  ${error}`)));
          process.exit(1);
        }
      } else if (options.show) {
        await manager.loadConfig();
        const config = manager.getConfig();
        console.log(chalk.blue.bold('Current Configuration:'));
        console.log(JSON.stringify(config, null, 2));
      } else {
        console.log(chalk.red('No config command specified. Use --generate, --validate, or --show'));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Configuration error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Global error handler
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  console.log(chalk.blue.bold('olbench - Ollama Benchmark Tool\n'));
  console.log(chalk.yellow('Quick Start:'));
  console.log(`  ${chalk.cyan('olbench info')} - Check your system`);
  console.log(`  ${chalk.cyan('olbench discover')} - Find models to test`);
  console.log(`  ${chalk.cyan('olbench run')} - Run benchmarks`);
  console.log();
  program.outputHelp();
}
