export interface OllamaModel {
    name: string;
    model: string;
    modified_at: string;
    size: number;
    digest: string;
    details: {
        parent_model: string;
        format: string;
        family: string;
        families: string[];
        parameter_size: string;
        quantization_level: string;
    };
}
export interface ModelInfo {
    name: string;
    family: string;
    parameterSize: string;
    sizeGB: number;
    quantization: string;
    isInstalled: boolean;
    recommendedForRAM: number[];
    downloadSizeGB?: number;
    diskSizeGB?: number;
}
export interface PopularModel {
    name: string;
    description: string;
    family: string;
    parameterSize: string;
    minRAM: number;
    category: 'chat' | 'code' | 'vision' | 'reasoning';
    popularity: number;
    downloadSizeGB?: number;
    diskSizeGB?: number;
}
export declare class ModelDiscovery {
    private baseUrl;
    private popularModels;
    getInstalledModels(): Promise<ModelInfo[]>;
    getPopularModels(category?: 'chat' | 'code' | 'vision' | 'reasoning'): PopularModel[];
    getRecommendedModelsForRAM(ramGB: number, category?: 'chat' | 'code' | 'vision' | 'reasoning'): PopularModel[];
    getModelRecommendations(ramGB: number): Promise<{
        installed: ModelInfo[];
        recommended: PopularModel[];
        canInstall: PopularModel[];
    }>;
    pullModel(modelName: string): Promise<void>;
    checkModelExists(modelName: string): Promise<boolean>;
    private getRAMRecommendation;
    getTrendingModels(): PopularModel[];
    searchModels(query: string): PopularModel[];
    getModelsByCategory(): {
        [key: string]: PopularModel[];
    };
    getModelDownloadSize(modelName: string): {
        downloadGB: number;
        diskGB: number;
    } | null;
    formatSizeInfo(sizeGB: number): string;
    getModelDetails(modelName: string): PopularModel | null;
    calculateTotalDownloadSize(modelNames: string[]): {
        totalDownloadGB: number;
        totalDiskGB: number;
        breakdown: Array<{
            name: string;
            downloadGB: number;
            diskGB: number;
        }>;
    };
    calculateDownloadSizeForMissingModels(modelNames: string[]): Promise<{
        totalDownloadGB: number;
        totalDiskGB: number;
        breakdown: Array<{
            name: string;
            downloadGB: number;
            diskGB: number;
            actualSizeGB?: number;
            isInstalled: boolean;
        }>;
        installedCount: number;
        missingCount: number;
    }>;
    private estimateModelSize;
}
//# sourceMappingURL=model-discovery.d.ts.map