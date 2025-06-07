import { ModelBenchmarkResult, BenchmarkMetrics } from './benchmark-runner.js';
import { SystemInfo } from './system-detection.js';
export interface QualityMetrics {
    averageResponseLength: number;
    responseTime: number;
    consistency: number;
    completionRate: number;
}
export interface MemoryStats {
    peakMemoryUsage: number;
    averageMemoryUsage: number;
    memoryEfficiency: number;
}
export interface BenchmarkResult {
    model: string;
    tokensPerSecond: number;
    firstTokenLatency: number;
    totalLatency: number;
    memoryUsage: MemoryStats;
    quality: QualityMetrics;
    timestamp: Date;
    systemInfo: SystemInfo;
    rawMetrics: BenchmarkMetrics[];
}
export interface BenchmarkReport {
    summary: {
        totalModels: number;
        totalBenchmarks: number;
        fastestModel: string;
        slowestModel: string;
        averageTokensPerSecond: number;
        timestamp: Date;
    };
    systemInfo: SystemInfo;
    results: BenchmarkResult[];
    metadata: {
        version: string;
        duration: number;
        configuration: any;
    };
}
export declare class ResultsProcessor {
    processBenchmarkResults(modelResults: ModelBenchmarkResult[], systemInfo: SystemInfo, startTime: Date, configuration: any): BenchmarkReport;
    private processModelResult;
    private calculateMemoryStats;
    private calculateQualityMetrics;
    private calculateSummary;
    compareReports(baseline: BenchmarkReport, current: BenchmarkReport): ComparisonReport;
    private compareModels;
    private calculateAverageImprovement;
    formatSummary(report: BenchmarkReport): string;
}
export interface ModelComparison {
    model: string;
    tokensPerSecond: {
        baseline: number;
        current: number;
        change: number;
    };
    firstTokenLatency: {
        baseline: number;
        current: number;
        change: number;
    };
    memoryUsage: {
        baseline: number;
        current: number;
        change: number;
    };
}
export interface ComparisonReport {
    baseline: {
        timestamp: Date;
        totalModels: number;
        averageTokensPerSecond: number;
    };
    current: {
        timestamp: Date;
        totalModels: number;
        averageTokensPerSecond: number;
    };
    comparisons: ModelComparison[];
    summary: {
        modelsCompared: number;
        averageSpeedImprovement: number;
        averageLatencyImprovement: number;
    };
}
//# sourceMappingURL=results-processor.d.ts.map