export class ResultsProcessor {
    processBenchmarkResults(modelResults, systemInfo, startTime, configuration) {
        const results = modelResults.map(modelResult => this.processModelResult(modelResult, systemInfo));
        const summary = this.calculateSummary(results);
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();
        return {
            summary: {
                ...summary,
                timestamp: endTime,
            },
            systemInfo,
            results,
            metadata: {
                version: '1.0.0',
                duration,
                configuration,
            },
        };
    }
    processModelResult(modelResult, systemInfo) {
        const memoryStats = this.calculateMemoryStats(modelResult.metrics);
        const qualityMetrics = this.calculateQualityMetrics(modelResult.metrics);
        return {
            model: modelResult.model,
            tokensPerSecond: modelResult.averageTokensPerSecond,
            firstTokenLatency: modelResult.averageFirstTokenLatency,
            totalLatency: modelResult.averageTotalLatency,
            memoryUsage: memoryStats,
            quality: qualityMetrics,
            timestamp: new Date(),
            systemInfo,
            rawMetrics: modelResult.metrics,
        };
    }
    calculateMemoryStats(metrics) {
        const memoryUsages = metrics.map(m => m.memoryUsed);
        const peakMemoryUsage = Math.max(...memoryUsages);
        const averageMemoryUsage = memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length;
        // Calculate memory efficiency as tokens per MB
        const totalTokens = metrics.reduce((sum, m) => sum + m.totalTokens, 0);
        const memoryEfficiency = totalTokens / averageMemoryUsage;
        return {
            peakMemoryUsage,
            averageMemoryUsage,
            memoryEfficiency,
        };
    }
    calculateQualityMetrics(metrics) {
        const totalResponses = metrics.length;
        const successfulResponses = metrics.filter(m => m.completionTokens > 0).length;
        const completionRate = (successfulResponses / totalResponses) * 100;
        const averageResponseLength = metrics.reduce((sum, m) => sum + m.completionTokens, 0) / totalResponses;
        const averageResponseTime = metrics.reduce((sum, m) => sum + m.totalLatency, 0) / totalResponses;
        // Calculate consistency as inverse of coefficient of variation
        const tokenCounts = metrics.map(m => m.completionTokens);
        const mean = tokenCounts.reduce((sum, count) => sum + count, 0) / tokenCounts.length;
        const variance = tokenCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / tokenCounts.length;
        const standardDeviation = Math.sqrt(variance);
        const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 1;
        const consistency = Math.max(0, 100 - (coefficientOfVariation * 100));
        return {
            averageResponseLength,
            responseTime: averageResponseTime,
            consistency,
            completionRate,
        };
    }
    calculateSummary(results) {
        const totalModels = results.length;
        const totalBenchmarks = results.reduce((sum, result) => sum + result.rawMetrics.length, 0);
        const sortedBySpeed = [...results].sort((a, b) => b.tokensPerSecond - a.tokensPerSecond);
        const fastestModel = sortedBySpeed[0]?.model || 'N/A';
        const slowestModel = sortedBySpeed[sortedBySpeed.length - 1]?.model || 'N/A';
        const averageTokensPerSecond = results.reduce((sum, result) => sum + result.tokensPerSecond, 0) / totalModels;
        return {
            totalModels,
            totalBenchmarks,
            fastestModel,
            slowestModel,
            averageTokensPerSecond,
        };
    }
    // Compare two benchmark reports
    compareReports(baseline, current) {
        const comparisons = [];
        for (const currentResult of current.results) {
            const baselineResult = baseline.results.find(r => r.model === currentResult.model);
            if (baselineResult) {
                comparisons.push(this.compareModels(baselineResult, currentResult));
            }
        }
        return {
            baseline: {
                timestamp: baseline.summary.timestamp,
                totalModels: baseline.summary.totalModels,
                averageTokensPerSecond: baseline.summary.averageTokensPerSecond,
            },
            current: {
                timestamp: current.summary.timestamp,
                totalModels: current.summary.totalModels,
                averageTokensPerSecond: current.summary.averageTokensPerSecond,
            },
            comparisons,
            summary: {
                modelsCompared: comparisons.length,
                averageSpeedImprovement: this.calculateAverageImprovement(comparisons, 'tokensPerSecond'),
                averageLatencyImprovement: this.calculateAverageImprovement(comparisons, 'firstTokenLatency'),
            },
        };
    }
    compareModels(baseline, current) {
        const speedChange = ((current.tokensPerSecond - baseline.tokensPerSecond) / baseline.tokensPerSecond) * 100;
        const latencyChange = ((current.firstTokenLatency - baseline.firstTokenLatency) / baseline.firstTokenLatency) * 100;
        const memoryChange = ((current.memoryUsage.averageMemoryUsage - baseline.memoryUsage.averageMemoryUsage) / baseline.memoryUsage.averageMemoryUsage) * 100;
        return {
            model: current.model,
            tokensPerSecond: {
                baseline: baseline.tokensPerSecond,
                current: current.tokensPerSecond,
                change: speedChange,
            },
            firstTokenLatency: {
                baseline: baseline.firstTokenLatency,
                current: current.firstTokenLatency,
                change: latencyChange,
            },
            memoryUsage: {
                baseline: baseline.memoryUsage.averageMemoryUsage,
                current: current.memoryUsage.averageMemoryUsage,
                change: memoryChange,
            },
        };
    }
    calculateAverageImprovement(comparisons, metric) {
        const improvements = comparisons.map(c => {
            switch (metric) {
                case 'tokensPerSecond':
                    return c.tokensPerSecond.change;
                case 'firstTokenLatency':
                    return -c.firstTokenLatency.change; // Negative because lower latency is better
                default:
                    return 0;
            }
        });
        return improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
    }
    // Format results for display
    formatSummary(report) {
        const lines = [
            '# Benchmark Results Summary',
            '',
            `**Date:** ${report.summary.timestamp.toISOString()}`,
            `**Models Tested:** ${report.summary.totalModels}`,
            `**Total Benchmarks:** ${report.summary.totalBenchmarks}`,
            `**Duration:** ${(report.metadata.duration / 1000).toFixed(1)}s`,
            '',
            `**Fastest Model:** ${report.summary.fastestModel}`,
            `**Slowest Model:** ${report.summary.slowestModel}`,
            `**Average Speed:** ${report.summary.averageTokensPerSecond.toFixed(1)} tokens/sec`,
            '',
            '## System Information',
            `- OS: ${report.systemInfo.os} (${report.systemInfo.architecture})`,
            `- RAM: ${report.systemInfo.totalRAM}GB total, ${report.systemInfo.availableRAM}GB available`,
            `- Ollama: ${report.systemInfo.ollamaVersion || 'Not detected'}`,
        ];
        if (report.systemInfo.gpus.length > 0) {
            lines.push('- GPUs:');
            report.systemInfo.gpus.forEach(gpu => {
                lines.push(`  - ${gpu.vendor} ${gpu.model} (${gpu.vram}MB VRAM)`);
            });
        }
        return lines.join('\\n');
    }
}
//# sourceMappingURL=results-processor.js.map