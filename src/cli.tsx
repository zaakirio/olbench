#!/usr/bin/env node

import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import { OllamaBenchmarkApp } from './components/App.js';

const program = new Command();

program
  .name('olbench')
  .description('Comprehensive Node.js-based benchmarking tool for Ollama local LLMs')
  .version('1.0.0');

program
  .command('run')
  .description('Run benchmark tests')
  .option('-m, --models <models>', 'Comma-separated list of models to test')
  .option('-c, --config <path>', 'Path to configuration file')
  .option('-t, --tier <number>', 'Specific RAM tier to test (1-4)', parseInt)
  .option('-o, --output <path>', 'Output file path')
  .option('-f, --format <format>', 'Output format (json, csv, markdown)', 'json')
  .option('-i, --iterations <number>', 'Number of benchmark iterations', parseInt)
  .option('--concurrency <number>', 'Number of concurrent requests', parseInt)
  .option('--timeout <seconds>', 'Timeout per request in seconds', parseInt)
  .option('-p, --prompts <type>', 'Prompt set to use (default, coding, creative, reasoning)', 'default')
  .option('-v, --verbose', 'Verbose output')
  .option('-w, --warmup <number>', 'Number of warmup iterations', parseInt)
  .action((options) => {
    const models = options.models ? options.models.split(',').map((m: string) => m.trim()) : undefined;
    
    render(
      <OllamaBenchmarkApp
        command="run"
        options={{
          ...options,
          models,
        }}
      />
    );
  });

program
  .command('compare')
  .description('Compare benchmark results')
  .option('-b, --baseline <path>', 'Path to baseline results file')
  .option('-c, --current <path>', 'Path to current results file')
  .option('-o, --output <path>', 'Output file path for comparison')
  .option('-f, --format <format>', 'Output format (json, markdown)', 'markdown')
  .action((options) => {
    render(
      <OllamaBenchmarkApp
        command="compare"
        options={options}
      />
    );
  });

program
  .command('interactive')
  .alias('i')
  .description('Run benchmark in interactive mode')
  .action(() => {
    render(
      <OllamaBenchmarkApp
        command="interactive"
        options={{}}
      />
    );
  });

program
  .command('info')
  .description('Display system information and available models')
  .option('-v, --verbose', 'Show detailed information')
  .action((options) => {
    render(
      <OllamaBenchmarkApp
        command="info"
        options={options}
      />
    );
  });

program
  .command('config')
  .description('Configuration management')
  .option('-g, --generate <path>', 'Generate sample configuration file')
  .option('-v, --validate <path>', 'Validate configuration file')
  .option('-s, --show', 'Show current configuration')
  .action((options) => {
    render(
      <OllamaBenchmarkApp
        command="config"
        options={options}
      />
    );
  });

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}