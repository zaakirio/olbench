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
export declare class ConfigManager {
    private config;
    private defaultConfigPath;
    constructor();
    loadConfig(configPath?: string): Promise<AppConfig>;
    saveConfig(config: AppConfig, configPath?: string): Promise<void>;
    applyCommandLineOverrides(options: CommandLineOptions): BenchmarkConfig;
    getConfig(): AppConfig;
    updateConfig(updates: Partial<AppConfig>): void;
    private getDefaultConfig;
    private mergeConfig;
    private mergeDeep;
    validateConfig(config: AppConfig): {
        valid: boolean;
        errors: string[];
    };
    getPromptSet(name: keyof AppConfig['prompts']): string[];
    generateSampleConfig(outputPath: string): Promise<void>;
}
//# sourceMappingURL=config-manager.d.ts.map