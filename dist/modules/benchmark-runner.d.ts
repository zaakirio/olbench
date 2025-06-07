export interface BenchmarkConfig {
    models: string[];
    prompts: string[];
    iterations: number;
    concurrency: number;
    timeout: number;
    warmupIterations?: number;
}
export interface BenchmarkMetrics {
    model: string;
    prompt: string;
    iteration: number;
    tokensPerSecond: number;
    firstTokenLatency: number;
    totalLatency: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    memoryUsed: number;
    timestamp: Date;
}
export interface ModelBenchmarkResult {
    model: string;
    metrics: BenchmarkMetrics[];
    averageTokensPerSecond: number;
    averageFirstTokenLatency: number;
    averageTotalLatency: number;
    minTokensPerSecond: number;
    maxTokensPerSecond: number;
    standardDeviation: number;
}
export declare class BenchmarkRunner {
    private baseUrl;
    runBenchmark(config: BenchmarkConfig): Promise<ModelBenchmarkResult[]>;
    private ensureModel;
    private pullModel;
    private runSingleBenchmark;
    private calculateAggregateMetrics;
    runConcurrentBenchmark(model: string, prompt: string, concurrency: number, timeout: number): Promise<BenchmarkMetrics[]>;
    static getDefaultPrompts(): string[];
    static createDefaultConfig(models: string[]): BenchmarkConfig;
}
//# sourceMappingURL=benchmark-runner.d.ts.map