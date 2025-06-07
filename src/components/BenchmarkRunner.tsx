import React, { useState, useEffect } from 'react';
import { Box, Text, Newline } from 'ink';
import Spinner from 'ink-spinner';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import { BenchmarkRunner as Runner, ModelBenchmarkResult } from '../modules/benchmark-runner.js';
import { SystemDetector, SystemInfo } from '../modules/system-detection.js';
import { ModelTierManager } from '../modules/model-tiers.js';
import { ConfigManager } from '../modules/config-manager.js';
import { ResultsProcessor, BenchmarkReport } from '../modules/results-processor.js';
import { ReportGenerator } from '../modules/report-generator.js';
import { AppOptions } from './App.js';
import { ProgressBar } from './ProgressBar.js';
import { ResultsTable } from './ResultsTable.js';

interface Props {
  options: AppOptions;
}

export const BenchmarkRunner: React.FC<Props> = ({ options }) => {
  const [status, setStatus] = useState<'initializing' | 'detecting' | 'configuring' | 'running' | 'processing' | 'complete' | 'error'>('initializing');
  const [currentStep, setCurrentStep] = useState('');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<BenchmarkReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runBenchmark();
  }, []);

  const runBenchmark = async () => {
    try {
      // Initialize
      setStatus('detecting');
      setCurrentStep('Detecting system configuration...');
      
      const detector = new SystemDetector();
      const sysInfo = await detector.detectSystem();
      setSystemInfo(sysInfo);

      if (!sysInfo.ollamaAvailable) {
        throw new Error('Ollama is not running. Please start Ollama and try again.');
      }

      // Load configuration
      setStatus('configuring');
      setCurrentStep('Loading configuration...');
      
      const configManager = new ConfigManager();
      await configManager.loadConfig(options.config);
      
      const cliOptions = {
        ...options,
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
          const recommendedModels = tierManager.getRecommendedModels(sysInfo.totalRAM);
          modelsToTest = recommendedModels.map(m => m.name);
        }
      }

      if (modelsToTest.length === 0) {
        throw new Error('No models to test. Check your RAM tier or specify models manually.');
      }

      // Run benchmarks
      setStatus('running');
      setCurrentStep(`Running benchmarks for ${modelsToTest.length} models...`);
      
      const runner = new Runner();
      const totalSteps = modelsToTest.length * benchmarkConfig.iterations * benchmarkConfig.prompts.length;
      setProgress({ current: 0, total: totalSteps });

      // Update the benchmark config with determined models
      benchmarkConfig.models = modelsToTest;
      
      const startTime = new Date();
      const modelResults = await runner.runBenchmark(benchmarkConfig);
      
      // Process results
      setStatus('processing');
      setCurrentStep('Processing results...');
      
      const processor = new ResultsProcessor();
      const report = processor.processBenchmarkResults(modelResults, sysInfo, startTime, benchmarkConfig);
      
      setResults(report);
      setStatus('complete');
      
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
        setCurrentStep(`Results saved to ${options.output}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus('error');
    }
  };

  if (status === 'error') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red" bold>❌ Benchmark Failed</Text>
        <Text color="red">{error}</Text>
      </Box>
    );
  }

  if (status === 'complete' && results) {
    return (
      <Box flexDirection="column" padding={1}>
        <Gradient name="rainbow">
          <BigText text="Complete!" />
        </Gradient>
        
        <Box marginY={1}>
          <Text color="green" bold>✅ Benchmark completed successfully!</Text>
        </Box>

        <Box flexDirection="column" marginY={1}>
          <Text bold underline>Summary:</Text>
          <Text>• Models tested: {results.summary.totalModels}</Text>
          <Text>• Total benchmarks: {results.summary.totalBenchmarks}</Text>
          <Text>• Duration: {(results.metadata.duration / 1000).toFixed(1)}s</Text>
          <Text>• Fastest model: <Text color="green">{results.summary.fastestModel}</Text></Text>
          <Text>• Average speed: {results.summary.averageTokensPerSecond.toFixed(1)} tokens/sec</Text>
        </Box>

        {results.results.length > 0 && (
          <ResultsTable results={results.results} />
        )}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Gradient name="rainbow">
        <BigText text="Ollama Bench" />
      </Gradient>

      <Box marginY={1}>
        <Text bold>🚀 Running Ollama Benchmark</Text>
      </Box>

      {systemInfo && (
        <Box flexDirection="column" marginBottom={1}>
          <Text color="blue" bold>System Information:</Text>
          <Text>• OS: {systemInfo.os} ({systemInfo.architecture})</Text>
          <Text>• RAM: {systemInfo.totalRAM}GB total, {systemInfo.availableRAM}GB available</Text>
          <Text>• Ollama: v{systemInfo.ollamaVersion}</Text>
          {systemInfo.gpus.length > 0 && (
            <Text>• GPU: {systemInfo.gpus[0].vendor} {systemInfo.gpus[0].model}</Text>
          )}
        </Box>
      )}

      <Box marginY={1}>
        <Spinner type="dots" />
        <Text> {currentStep}</Text>
      </Box>

      {progress.total > 0 && (
        <Box marginY={1}>
          <ProgressBar current={progress.current} total={progress.total} />
        </Box>
      )}

      <Box marginY={1}>
        <Text color="gray">
          Status: <Text color="yellow">{status}</Text>
        </Text>
      </Box>
    </Box>
  );
};