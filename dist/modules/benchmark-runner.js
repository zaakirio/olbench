export class BenchmarkRunner {
    baseUrl = 'http://localhost:11434';
    async runBenchmark(config) {
        const results = [];
        for (const model of config.models) {
            // Pull model if not available
            await this.ensureModel(model);
            const modelMetrics = [];
            // Warmup iterations
            if (config.warmupIterations && config.warmupIterations > 0) {
                for (let i = 0; i < config.warmupIterations; i++) {
                    await this.runSingleBenchmark(model, config.prompts[0], 0, config.timeout);
                }
            }
            // Actual benchmark iterations
            for (let iteration = 0; iteration < config.iterations; iteration++) {
                for (const prompt of config.prompts) {
                    const metrics = await this.runSingleBenchmark(model, prompt, iteration, config.timeout);
                    if (metrics) {
                        modelMetrics.push(metrics);
                    }
                }
            }
            if (modelMetrics.length > 0) {
                results.push(this.calculateAggregateMetrics(model, modelMetrics));
            }
        }
        return results;
    }
    async ensureModel(model) {
        try {
            // Check if model exists
            const response = await fetch(`${this.baseUrl}/api/show`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: model }),
            });
            if (!response.ok) {
                // Model doesn't exist, pull it
                await this.pullModel(model);
            }
        }
        catch (error) {
            throw new Error(`Failed to ensure model ${model}: ${error}`);
        }
    }
    async pullModel(model) {
        const response = await fetch(`${this.baseUrl}/api/pull`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: model, stream: false }),
        });
        if (!response.ok) {
            throw new Error(`Failed to pull model ${model}: ${response.statusText}`);
        }
        await response.json();
    }
    async runSingleBenchmark(model, prompt, iteration, timeout) {
        const startTime = Date.now();
        const memoryBefore = process.memoryUsage().heapUsed;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);
            const request = {
                model,
                prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    num_predict: 256,
                },
            };
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }
            const data = await response.json();
            const endTime = Date.now();
            const memoryAfter = process.memoryUsage().heapUsed;
            // Calculate metrics
            const totalLatency = endTime - startTime;
            const promptEvalTime = (data.prompt_eval_duration || 0) / 1_000_000; // Convert nanoseconds to milliseconds
            const evalTime = (data.eval_duration || 0) / 1_000_000;
            const firstTokenLatency = promptEvalTime;
            const completionTokens = data.eval_count || 0;
            const promptTokens = data.prompt_eval_count || 0;
            const totalTokens = promptTokens + completionTokens;
            const tokensPerSecond = completionTokens > 0 ? (completionTokens / evalTime) * 1000 : 0;
            return {
                model,
                prompt: prompt.substring(0, 50) + '...', // Truncate prompt for display
                iteration,
                tokensPerSecond,
                firstTokenLatency,
                totalLatency,
                promptTokens,
                completionTokens,
                totalTokens,
                memoryUsed: (memoryAfter - memoryBefore) / (1024 * 1024), // Convert to MB
                timestamp: new Date(),
            };
        }
        catch (error) {
            console.error(`Benchmark failed for ${model}: ${error}`);
            return null;
        }
    }
    calculateAggregateMetrics(model, metrics) {
        const tokensPerSecondValues = metrics.map(m => m.tokensPerSecond);
        const firstTokenLatencies = metrics.map(m => m.firstTokenLatency);
        const totalLatencies = metrics.map(m => m.totalLatency);
        const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
        const standardDeviation = (arr) => {
            const avg = average(arr);
            const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
            return Math.sqrt(average(squareDiffs));
        };
        return {
            model,
            metrics,
            averageTokensPerSecond: average(tokensPerSecondValues),
            averageFirstTokenLatency: average(firstTokenLatencies),
            averageTotalLatency: average(totalLatencies),
            minTokensPerSecond: Math.min(...tokensPerSecondValues),
            maxTokensPerSecond: Math.max(...tokensPerSecondValues),
            standardDeviation: standardDeviation(tokensPerSecondValues),
        };
    }
    // Run concurrent benchmarks
    async runConcurrentBenchmark(model, prompt, concurrency, timeout) {
        const promises = Array(concurrency).fill(null).map((_, index) => this.runSingleBenchmark(model, prompt, index, timeout));
        const results = await Promise.all(promises);
        return results.filter((r) => r !== null);
    }
    // Get default benchmark prompts
    static getDefaultPrompts() {
        return [
            "Explain quantum computing in simple terms.",
            "Write a short story about a robot discovering emotions.",
            "Solve this math problem: What is 15% of 240?",
            "Create a Python function to calculate the Fibonacci sequence.",
            "Describe the process of photosynthesis in detail.",
        ];
    }
    // Create default benchmark configuration
    static createDefaultConfig(models) {
        return {
            models,
            prompts: BenchmarkRunner.getDefaultPrompts(),
            iterations: 5,
            concurrency: 1,
            timeout: 300,
            warmupIterations: 2,
        };
    }
}
//# sourceMappingURL=benchmark-runner.js.map