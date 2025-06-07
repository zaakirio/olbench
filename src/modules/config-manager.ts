import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'yaml';
import { BenchmarkConfig } from './benchmark-runner.js';

export interface AppConfig {
  version: string;
  benchmark: {
    timeout: number;
    iterations: number;
    concurrency: number;
    warmupIterations: number;
  };
  ramTiers: {
    tier1: TierConfig;
    tier2: TierConfig;
    tier3: TierConfig;
    tier4: TierConfig;
  };
  prompts: {
    default: string[];
    coding: string[];
    creative: string[];
    reasoning: string[];
  };
  output: {
    formats: string[];
    includeSystemInfo: boolean;
    saveRawResponses: boolean;
    directory: string;
  };
  ollama: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
}

export interface TierConfig {
  minRam: number;
  maxRam: number;
  models: {
    name: string;
    priority: number;
  }[];
}

export interface CommandLineOptions {
  models?: string[];
  config?: string;
  tier?: number;
  output?: string;
  format?: string;
  iterations?: number;
  concurrency?: number;
  timeout?: number;
  prompts?: string[];
  verbose?: boolean;
  warmup?: number;
}

export class ConfigManager {
  private config: AppConfig;
  private defaultConfigPath: string;

  constructor() {
    this.defaultConfigPath = path.join(process.cwd(), 'config', 'default.yml');
    this.config = this.getDefaultConfig();
  }

  async loadConfig(configPath?: string): Promise<AppConfig> {
    const pathToLoad = configPath || this.defaultConfigPath;
    
    try {
      // Check if config file exists
      await fs.access(pathToLoad);
      const configContent = await fs.readFile(pathToLoad, 'utf-8');
      const parsedConfig = yaml.parse(configContent) as Partial<AppConfig>;
      
      // Merge with default config
      this.config = this.mergeConfig(this.getDefaultConfig(), parsedConfig);
      return this.config;
    } catch (error) {
      if (configPath) {
        throw new Error(`Failed to load config file: ${configPath}`);
      }
      // If default config doesn't exist, use built-in defaults
      return this.config;
    }
  }

  async saveConfig(config: AppConfig, configPath?: string): Promise<void> {
    const pathToSave = configPath || this.defaultConfigPath;
    const configDir = path.dirname(pathToSave);
    
    // Ensure config directory exists
    await fs.mkdir(configDir, { recursive: true });
    
    const yamlContent = yaml.stringify(config, {
      indent: 2,
      lineWidth: 80,
    });
    
    await fs.writeFile(pathToSave, yamlContent, 'utf-8');
  }

  applyCommandLineOverrides(options: CommandLineOptions): BenchmarkConfig {
    const benchmarkConfig: BenchmarkConfig = {
      models: options.models || [],
      prompts: options.prompts || this.config.prompts.default,
      iterations: options.iterations || this.config.benchmark.iterations,
      concurrency: options.concurrency || this.config.benchmark.concurrency,
      timeout: options.timeout || this.config.benchmark.timeout,
      warmupIterations: options.warmup ?? this.config.benchmark.warmupIterations,
    };

    return benchmarkConfig;
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AppConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
  }

  private getDefaultConfig(): AppConfig {
    return {
      version: '1.0.0',
      benchmark: {
        timeout: 300,
        iterations: 5,
        concurrency: 1,
        warmupIterations: 2,
      },
      ramTiers: {
        tier1: {
          minRam: 4,
          maxRam: 7,
          models: [
            { name: 'deepseek-r1:1.5b', priority: 1 },
            { name: 'gemma:2b', priority: 2 },
            { name: 'phi:2.7b', priority: 3 },
            { name: 'phi3:3.8b', priority: 4 },
          ],
        },
        tier2: {
          minRam: 8,
          maxRam: 15,
          models: [
            { name: 'phi3:3.8b', priority: 1 },
            { name: 'gemma2:9b', priority: 2 },
            { name: 'mistral:7b', priority: 3 },
            { name: 'llama3.1:8b', priority: 4 },
            { name: 'deepseek-r1:8b', priority: 5 },
            { name: 'llava:7b', priority: 6 },
          ],
        },
        tier3: {
          minRam: 16,
          maxRam: 31,
          models: [
            { name: 'gemma2:9b', priority: 1 },
            { name: 'mistral:7b', priority: 2 },
            { name: 'phi4:14b', priority: 3 },
            { name: 'deepseek-r1:8b', priority: 4 },
            { name: 'deepseek-r1:14b', priority: 5 },
            { name: 'llava:7b', priority: 6 },
            { name: 'llava:13b', priority: 7 },
          ],
        },
        tier4: {
          minRam: 32,
          maxRam: Infinity,
          models: [
            { name: 'phi4:14b', priority: 1 },
            { name: 'deepseek-r1:14b', priority: 2 },
            { name: 'deepseek-r1:32b', priority: 3 },
          ],
        },
      },
      prompts: {
        default: [
          'Explain quantum computing in simple terms.',
          'Write a short story about a robot discovering emotions.',
          'Solve this math problem: What is 15% of 240?',
          'Create a Python function to calculate the Fibonacci sequence.',
          'Describe the process of photosynthesis in detail.',
        ],
        coding: [
          'Write a function to reverse a string in Python.',
          'Implement a binary search algorithm in JavaScript.',
          'Create a REST API endpoint using Express.js.',
          'Write a recursive function to calculate factorial.',
          'Implement a simple linked list in C++.',
        ],
        creative: [
          'Write a haiku about artificial intelligence.',
          'Create a dialogue between two characters meeting for the first time.',
          'Describe a futuristic city in 100 words.',
          'Write a product description for an innovative gadget.',
          'Create a short poem about the changing seasons.',
        ],
        reasoning: [
          'If a train travels 60mph for 2.5 hours, how far does it go?',
          'What are the ethical implications of autonomous vehicles?',
          'Compare the advantages and disadvantages of renewable energy.',
          'Explain the logical fallacy in: "All birds can fly, penguins are birds, therefore penguins can fly."',
          'How would you prioritize tasks when everything seems urgent?',
        ],
      },
      output: {
        formats: ['json', 'csv', 'markdown'],
        includeSystemInfo: true,
        saveRawResponses: false,
        directory: './benchmark-results',
      },
      ollama: {
        baseUrl: 'http://localhost:11434',
        timeout: 300,
        retries: 3,
      },
    };
  }

  private mergeConfig(base: AppConfig, override: Partial<AppConfig>): AppConfig {
    const merged = { ...base };

    for (const key in override) {
      const value = override[key as keyof AppConfig];
      if (value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          (merged as any)[key] = this.mergeDeep((base as any)[key], value);
        } else {
          (merged as any)[key] = value;
        }
      }
    }

    return merged;
  }

  private mergeDeep(target: any, source: any): any {
    if (typeof target !== 'object' || target === null) {
      return source;
    }
    if (typeof source !== 'object' || source === null) {
      return target;
    }

    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
          result[key] = this.mergeDeep(target[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  // Validate configuration
  validateConfig(config: AppConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate benchmark settings
    if (config.benchmark.iterations < 1) {
      errors.push('Benchmark iterations must be at least 1');
    }
    if (config.benchmark.timeout < 1) {
      errors.push('Benchmark timeout must be at least 1 second');
    }
    if (config.benchmark.concurrency < 1) {
      errors.push('Benchmark concurrency must be at least 1');
    }

    // Validate RAM tiers
    const tiers = [config.ramTiers.tier1, config.ramTiers.tier2, config.ramTiers.tier3, config.ramTiers.tier4];
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      if (tier.minRam >= tier.maxRam && tier.maxRam !== Infinity) {
        errors.push(`Tier ${i + 1}: minRam must be less than maxRam`);
      }
      if (tier.models.length === 0) {
        errors.push(`Tier ${i + 1}: must have at least one model`);
      }
    }

    // Validate prompts
    if (config.prompts.default.length === 0) {
      errors.push('Default prompts must contain at least one prompt');
    }

    // Validate output settings
    if (config.output.formats.length === 0) {
      errors.push('Output formats must contain at least one format');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Get prompt set by name
  getPromptSet(name: keyof AppConfig['prompts']): string[] {
    return this.config.prompts[name] || this.config.prompts.default;
  }

  // Generate a sample configuration file
  async generateSampleConfig(outputPath: string): Promise<void> {
    const sampleConfig = this.getDefaultConfig();
    await this.saveConfig(sampleConfig, outputPath);
  }
}