import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';
import { BenchmarkRunner as Runner } from '../modules/benchmark-runner.js';
import { SystemDetector } from '../modules/system-detection.js';
import { ModelTierManager } from '../modules/model-tiers.js';
import { ConfigManager } from '../modules/config-manager.js';
import { ResultsProcessor } from '../modules/results-processor.js';
import { ReportGenerator } from '../modules/report-generator.js';
import { ProgressBar } from './ProgressBar.js';
import { ResultsTable } from './ResultsTable.js';
export const BenchmarkRunner = ({ options }) => {
    const [status, setStatus] = useState('initializing');
    const [currentStep, setCurrentStep] = useState('');
    const [systemInfo, setSystemInfo] = useState(null);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
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
                    }
                    else {
                        throw new Error(`Invalid tier: ${options.tier}`);
                    }
                }
                else {
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
                const format = options.format || 'json';
                await reportGenerator.generateReport(report, {
                    format,
                    outputPath: options.output,
                    includeRawData: false,
                    includeSystemInfo: true,
                    prettify: true,
                });
                setCurrentStep(`Results saved to ${options.output}`);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setStatus('error');
        }
    };
    if (status === 'error') {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "red", bold: true }, "\u274C Benchmark Failed"),
            React.createElement(Text, { color: "red" }, error)));
    }
    if (status === 'complete' && results) {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Gradient, { name: "rainbow" },
                React.createElement(BigText, { text: "Complete!" })),
            React.createElement(Box, { marginY: 1 },
                React.createElement(Text, { color: "green", bold: true }, "\u2705 Benchmark completed successfully!")),
            React.createElement(Box, { flexDirection: "column", marginY: 1 },
                React.createElement(Text, { bold: true, underline: true }, "Summary:"),
                React.createElement(Text, null,
                    "\u2022 Models tested: ",
                    results.summary.totalModels),
                React.createElement(Text, null,
                    "\u2022 Total benchmarks: ",
                    results.summary.totalBenchmarks),
                React.createElement(Text, null,
                    "\u2022 Duration: ",
                    (results.metadata.duration / 1000).toFixed(1),
                    "s"),
                React.createElement(Text, null,
                    "\u2022 Fastest model: ",
                    React.createElement(Text, { color: "green" }, results.summary.fastestModel)),
                React.createElement(Text, null,
                    "\u2022 Average speed: ",
                    results.summary.averageTokensPerSecond.toFixed(1),
                    " tokens/sec")),
            results.results.length > 0 && (React.createElement(ResultsTable, { results: results.results }))));
    }
    return (React.createElement(Box, { flexDirection: "column", padding: 1 },
        React.createElement(Gradient, { name: "rainbow" },
            React.createElement(BigText, { text: "Ollama Bench" })),
        React.createElement(Box, { marginY: 1 },
            React.createElement(Text, { bold: true }, "\uD83D\uDE80 Running Ollama Benchmark")),
        systemInfo && (React.createElement(Box, { flexDirection: "column", marginBottom: 1 },
            React.createElement(Text, { color: "blue", bold: true }, "System Information:"),
            React.createElement(Text, null,
                "\u2022 OS: ",
                systemInfo.os,
                " (",
                systemInfo.architecture,
                ")"),
            React.createElement(Text, null,
                "\u2022 RAM: ",
                systemInfo.totalRAM,
                "GB total, ",
                systemInfo.availableRAM,
                "GB available"),
            React.createElement(Text, null,
                "\u2022 Ollama: v",
                systemInfo.ollamaVersion),
            systemInfo.gpus.length > 0 && (React.createElement(Text, null,
                "\u2022 GPU: ",
                systemInfo.gpus[0].vendor,
                " ",
                systemInfo.gpus[0].model)))),
        React.createElement(Box, { marginY: 1 },
            React.createElement(Spinner, { type: "dots" }),
            React.createElement(Text, null,
                " ",
                currentStep)),
        progress.total > 0 && (React.createElement(Box, { marginY: 1 },
            React.createElement(ProgressBar, { current: progress.current, total: progress.total }))),
        React.createElement(Box, { marginY: 1 },
            React.createElement(Text, { color: "gray" },
                "Status: ",
                React.createElement(Text, { color: "yellow" }, status)))));
};
//# sourceMappingURL=BenchmarkRunner.js.map