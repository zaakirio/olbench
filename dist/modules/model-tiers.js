export const MODEL_TIERS = [
    {
        name: 'Tier 1 (4GB-7GB)',
        ramRange: [4, 7],
        priority: 1,
        models: [
            { name: 'deepseek-r1:1.5b', priority: 1, description: 'DeepSeek R1 1.5B - Lightweight reasoning model' },
            { name: 'gemma:2b', priority: 2, description: 'Google Gemma 2B - Efficient small model' },
            { name: 'phi:2.7b', priority: 3, description: 'Microsoft Phi 2.7B - Small but capable' },
            { name: 'phi3:3.8b', priority: 4, description: 'Microsoft Phi-3 3.8B - Enhanced small model' },
        ],
    },
    {
        name: 'Tier 2 (8GB-15GB)',
        ramRange: [8, 15],
        priority: 2,
        models: [
            { name: 'phi3:3.8b', priority: 1, description: 'Microsoft Phi-3 3.8B - Enhanced small model' },
            { name: 'gemma2:9b', priority: 2, description: 'Google Gemma 2 9B - Balanced performance' },
            { name: 'mistral:7b', priority: 3, description: 'Mistral 7B - High-performance medium model' },
            { name: 'llama3.1:8b', priority: 4, description: 'Meta Llama 3.1 8B - Latest Llama model' },
            { name: 'deepseek-r1:8b', priority: 5, description: 'DeepSeek R1 8B - Medium reasoning model' },
            { name: 'llava:7b', priority: 6, description: 'LLaVA 7B - Multimodal vision-language model' },
        ],
    },
    {
        name: 'Tier 3 (16GB-31GB)',
        ramRange: [16, 31],
        priority: 3,
        models: [
            { name: 'gemma2:9b', priority: 1, description: 'Google Gemma 2 9B - Balanced performance' },
            { name: 'mistral:7b', priority: 2, description: 'Mistral 7B - High-performance medium model' },
            { name: 'phi4:14b', priority: 3, description: 'Microsoft Phi-4 14B - Advanced reasoning' },
            { name: 'deepseek-r1:8b', priority: 4, description: 'DeepSeek R1 8B - Medium reasoning model' },
            { name: 'deepseek-r1:14b', priority: 5, description: 'DeepSeek R1 14B - Large reasoning model' },
            { name: 'llava:7b', priority: 6, description: 'LLaVA 7B - Multimodal vision-language model' },
            { name: 'llava:13b', priority: 7, description: 'LLaVA 13B - Large multimodal model' },
        ],
    },
    {
        name: 'Tier 4 (32GB+)',
        ramRange: [32, Infinity],
        priority: 4,
        models: [
            { name: 'phi4:14b', priority: 1, description: 'Microsoft Phi-4 14B - Advanced reasoning' },
            { name: 'deepseek-r1:14b', priority: 2, description: 'DeepSeek R1 14B - Large reasoning model' },
            { name: 'deepseek-r1:32b', priority: 3, description: 'DeepSeek R1 32B - Extra large reasoning model' },
        ],
    },
];
export class ModelTierManager {
    tiers = MODEL_TIERS;
    getTierByRAM(ramGB) {
        return this.tiers.find(tier => ramGB >= tier.ramRange[0] && ramGB <= tier.ramRange[1]) || null;
    }
    getTierByName(tierName) {
        return this.tiers.find(tier => tier.name === tierName) || null;
    }
    getAllTiers() {
        return [...this.tiers];
    }
    getModelsForRAM(ramGB) {
        const tier = this.getTierByRAM(ramGB);
        if (!tier)
            return [];
        // Sort by priority (lower number = higher priority)
        return [...tier.models].sort((a, b) => a.priority - b.priority);
    }
    getModelByName(modelName) {
        for (const tier of this.tiers) {
            const model = tier.models.find(m => m.name === modelName);
            if (model)
                return model;
        }
        return null;
    }
    // Get recommended models based on RAM and optional filter
    getRecommendedModels(ramGB, count = 3) {
        const models = this.getModelsForRAM(ramGB);
        return models.slice(0, count);
    }
    // Check if a model is available for given RAM
    isModelAvailable(modelName, ramGB) {
        const availableModels = this.getModelsForRAM(ramGB);
        return availableModels.some(m => m.name === modelName);
    }
    // Get all unique models across all tiers
    getAllModels() {
        const modelMap = new Map();
        for (const tier of this.tiers) {
            for (const model of tier.models) {
                if (!modelMap.has(model.name)) {
                    modelMap.set(model.name, model);
                }
            }
        }
        return Array.from(modelMap.values());
    }
    // Format tier information for display
    formatTierInfo(tier) {
        const lines = [
            `${tier.name}:`,
            `  RAM Range: ${tier.ramRange[0]}GB - ${tier.ramRange[1] === Infinity ? '∞' : tier.ramRange[1] + 'GB'}`,
            `  Models (${tier.models.length}):`,
        ];
        tier.models.forEach((model, index) => {
            lines.push(`    ${index + 1}. ${model.name}${model.description ? ' - ' + model.description : ''}`);
        });
        return lines.join('\\n');
    }
}
//# sourceMappingURL=model-tiers.js.map