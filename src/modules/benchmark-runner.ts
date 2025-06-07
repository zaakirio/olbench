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

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
  };
}

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class BenchmarkRunner {
  private baseUrl = 'http://localhost:11434';

  async runBenchmark(config: BenchmarkConfig): Promise<ModelBenchmarkResult[]> {
    const results: ModelBenchmarkResult[] = [];

    for (let modelIndex = 0; modelIndex < config.models.length; modelIndex++) {
      const model = config.models[modelIndex];
      console.log(`\n📋 [${modelIndex + 1}/${config.models.length}] Testing model: ${model}`);
      
      // Pull model if not available
      console.log(`  🔍 Checking model availability...`);
      await this.ensureModel(model);

      const modelMetrics: BenchmarkMetrics[] = [];

      // Warmup iterations
      if (config.warmupIterations && config.warmupIterations > 0) {
        console.log(`  🔥 Running ${config.warmupIterations} warmup iterations...`);
        for (let i = 0; i < config.warmupIterations; i++) {
          process.stdout.write(`    Warmup ${i + 1}/${config.warmupIterations}... `);
          await this.runSingleBenchmark(
            model,
            config.prompts[0],
            0,
            config.timeout
          );
          console.log('✅');
        }
      }

      // Actual benchmark iterations
      console.log(`  ⚡ Running ${config.iterations} benchmark iterations...`);
      const totalRuns = config.iterations * config.prompts.length;
      let currentRun = 0;
      
      for (let iteration = 0; iteration < config.iterations; iteration++) {
        for (const prompt of config.prompts) {
          currentRun++;
          process.stdout.write(`    Run ${currentRun}/${totalRuns} (iteration ${iteration + 1}, prompt ${config.prompts.indexOf(prompt) + 1})... `);
          
          const metrics = await this.runSingleBenchmark(
            model,
            prompt,
            iteration,
            config.timeout
          );
          
          if (metrics) {
            console.log(`✅ ${metrics.tokensPerSecond.toFixed(1)} tokens/sec`);
            modelMetrics.push(metrics);
          } else {
            console.log(`❌ Failed`);
          }
        }
      }

      if (modelMetrics.length > 0) {
        const aggregateResult = this.calculateAggregateMetrics(model, modelMetrics);
        results.push(aggregateResult);
        console.log(`  📊 ${model} completed: ${aggregateResult.averageTokensPerSecond.toFixed(1)} avg tokens/sec`);
      }
    }

    return results;
  }

  private async ensureModel(model: string): Promise<void> {
    try {
      console.log(`    • Checking if ${model} is available...`);
      
      // Check if model exists
      const response = await fetch(`${this.baseUrl}/api/show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: model }),
      });

      if (response.ok) {
        console.log(`    • ✅ ${model} is already installed`);
      } else {
        console.log(`    • ❌ ${model} is not installed`);
        throw new Error(`Model '${model}' is not installed. Please install it first with: ollama pull ${model}`);
      }
    } catch (error) {
      console.log(`    • ❌ Error checking ${model}: ${error}`);
      throw new Error(`Failed to ensure model ${model}: ${error}`);
    }
  }

  private async pullModel(model: string): Promise<void> {
    console.log(`      🔄 Starting download of ${model}...`);
    
    const response = await fetch(`${this.baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: model, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Failed to pull model ${model}: ${response.statusText}`);
    }

    console.log(`      ⏳ Downloading ${model}... (this may take several minutes)`);
    await response.json();
    console.log(`      ✅ Download of ${model} completed`);
  }

  private async runSingleBenchmark(
    model: string,
    prompt: string,
    iteration: number,
    timeout: number
  ): Promise<BenchmarkMetrics | null> {
    const startTime = Date.now();
    const memoryBefore = process.memoryUsage().heapUsed;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

      const request: OllamaGenerateRequest = {
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

      const data = await response.json() as OllamaGenerateResponse;
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
    } catch (error) {
      console.error(`Benchmark failed for ${model}: ${error}`);
      return null;
    }
  }

  private calculateAggregateMetrics(
    model: string,
    metrics: BenchmarkMetrics[]
  ): ModelBenchmarkResult {
    const tokensPerSecondValues = metrics.map(m => m.tokensPerSecond);
    const firstTokenLatencies = metrics.map(m => m.firstTokenLatency);
    const totalLatencies = metrics.map(m => m.totalLatency);

    const average = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const standardDeviation = (arr: number[]) => {
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
  async runConcurrentBenchmark(
    model: string,
    prompt: string,
    concurrency: number,
    timeout: number
  ): Promise<BenchmarkMetrics[]> {
    const promises = Array(concurrency).fill(null).map((_, index) =>
      this.runSingleBenchmark(model, prompt, index, timeout)
    );

    const results = await Promise.all(promises);
    return results.filter((r): r is BenchmarkMetrics => r !== null);
  }

  // Get default benchmark prompts
  static getDefaultPrompts(): string[] {
    return [
      "Explain quantum computing in simple terms.",
      "Write a short story about a robot discovering emotions.",
      "Solve this math problem: What is 15% of 240?",
      "Create a Python function to calculate the Fibonacci sequence.",
      "Describe the process of photosynthesis in detail.",
    ];
  }

  // Create default benchmark configuration
  static createDefaultConfig(models: string[]): BenchmarkConfig {
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