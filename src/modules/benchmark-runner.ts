import { getOllamaBaseUrl } from './ollama.js';

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

interface OllamaRunningModel {
  name: string;
  model: string;
  size: number;
  size_vram: number;
}

export class BenchmarkRunner {
  private baseUrl = getOllamaBaseUrl();

  async runBenchmark(config: BenchmarkConfig): Promise<ModelBenchmarkResult[]> {
    const results: ModelBenchmarkResult[] = [];

    for (let modelIndex = 0; modelIndex < config.models.length; modelIndex++) {
      const model = config.models[modelIndex];
      console.log(`\n[${modelIndex + 1}/${config.models.length}] Testing model: ${model}`);

      console.log(`  Checking model availability...`);
      await this.ensureModel(model);

      const modelMetrics: BenchmarkMetrics[] = [];

      // Warmup iterations
      if (config.warmupIterations && config.warmupIterations > 0) {
        console.log(`  Running ${config.warmupIterations} warmup iterations...`);
        for (let i = 0; i < config.warmupIterations; i++) {
          process.stdout.write(`    Warmup ${i + 1}/${config.warmupIterations}... `);
          await this.runSingleBenchmark(
            model,
            config.prompts[0],
            0,
            config.timeout
          );
          console.log('done');
        }
      }

      // Actual benchmark iterations
      console.log(`  Running ${config.iterations} benchmark iterations...`);
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
            console.log(`OK ${metrics.tokensPerSecond.toFixed(1)} tokens/sec`);
            modelMetrics.push(metrics);
          } else {
            console.log(`FAILED`);
          }
        }
      }

      if (modelMetrics.length > 0) {
        // Record the model's actual resident memory while it is loaded.
        const residentMemoryMB = await this.getModelMemoryMB(model);
        if (residentMemoryMB > 0) {
          modelMetrics.forEach(metric => {
            metric.memoryUsed = residentMemoryMB;
          });
        }

        const aggregateResult = this.calculateAggregateMetrics(model, modelMetrics);
        results.push(aggregateResult);
        console.log(`  ${model} completed: ${aggregateResult.averageTokensPerSecond.toFixed(1)} avg tokens/sec`);
      }
    }

    return results;
  }

  /**
   * Query Ollama's `/api/ps` endpoint for the resident memory of a loaded
   * model. Returns the total resident size in MB (RAM + VRAM), or 0 if the
   * model is not currently reported as running.
   */
  private async getModelMemoryMB(model: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ps`);
      if (!response.ok) {
        return 0;
      }
      const data = await response.json() as { models: OllamaRunningModel[] };
      const running = data.models?.find(m => m.name === model || m.model === model);
      return running ? running.size / (1024 * 1024) : 0;
    } catch {
      return 0;
    }
  }

  private async ensureModel(model: string): Promise<void> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: model }),
      });
    } catch (error) {
      throw new Error(`Failed to reach Ollama at ${this.baseUrl}: ${error instanceof Error ? error.message : String(error)}`);
    }

    if (!response.ok) {
      throw new Error(`Model '${model}' is not installed. Install it first with: ollama pull ${model}`);
    }
  }

  private async runSingleBenchmark(
    model: string,
    prompt: string,
    iteration: number,
    timeout: number
  ): Promise<BenchmarkMetrics | null> {
    const startTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

    try {
      const request: OllamaGenerateRequest = {
        model,
        prompt,
        stream: true,
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

      if (!response.ok || !response.body) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      // Read the streamed NDJSON response, measuring the wall-clock time until
      // the first token actually arrives (true time-to-first-token).
      let firstTokenLatency = 0;
      let final: OllamaGenerateResponse | null = null;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const handleLine = (line: string) => {
        if (!line.trim()) return;
        const chunk = JSON.parse(line) as OllamaGenerateResponse;
        if (firstTokenLatency === 0 && chunk.response) {
          firstTokenLatency = Date.now() - startTime;
        }
        if (chunk.done) {
          final = chunk;
        }
      };

      let streaming = true;
      while (streaming) {
        const { done, value } = await reader.read();
        if (done) {
          streaming = false;
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          handleLine(buffer.slice(0, newlineIndex));
          buffer = buffer.slice(newlineIndex + 1);
        }
      }
      if (buffer.trim()) {
        handleLine(buffer);
      }

      const endTime = Date.now();

      if (!final) {
        throw new Error('No completion received from Ollama');
      }
      const result = final as OllamaGenerateResponse;

      const totalLatency = endTime - startTime;
      const evalTime = (result.eval_duration || 0) / 1_000_000; // ns -> ms
      const completionTokens = result.eval_count || 0;
      const promptTokens = result.prompt_eval_count || 0;
      const totalTokens = promptTokens + completionTokens;
      const tokensPerSecond = completionTokens > 0 && evalTime > 0
        ? (completionTokens / evalTime) * 1000
        : 0;

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
        memoryUsed: 0, // Filled in per model from /api/ps once the model is loaded.
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Benchmark failed for ${model}: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    } finally {
      clearTimeout(timeoutId);
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