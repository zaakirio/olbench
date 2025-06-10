export interface ModelConfig {
    name: string;
    priority: number;
    description?: string;
    contextLength?: number;
    parameters?: string;
    memoryRequirement: number;
    gpuOptimized?: boolean;
    cpuOptimized?: boolean;
    quantization?: string;
}
export interface ModelTier {
    name: string;
    ramRange: [number, number];
    models: ModelConfig[];
    priority: number;
}
export declare const MODEL_TIERS: ModelTier[];
export declare class ModelTierManager {
    private tiers;
    getTierByRAM(ramGB: number): ModelTier | null;
    getTierByName(tierName: string): ModelTier | null;
    getAllTiers(): ModelTier[];
    getModelsForRAM(ramGB: number): ModelConfig[];
    getModelByName(modelName: string): ModelConfig | null;
    getRecommendedModels(ramGB: number, count?: number): ModelConfig[];
    getHardwareAwareRecommendations(systemInfo: {
        availableRAM: number;
        totalRAM: number;
        hasGPU: boolean;
        hasCUDA: boolean;
        architecture: string;
        os: string;
    }, count?: number): ModelConfig[];
    isModelAvailable(modelName: string, ramGB: number): boolean;
    getAllModels(): ModelConfig[];
    formatTierInfo(tier: ModelTier): string;
}
//# sourceMappingURL=model-tiers.d.ts.map