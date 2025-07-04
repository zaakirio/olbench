export class ModelDiscovery {
    baseUrl = 'http://localhost:11434';
    // Popular models based on Ollama registry and community usage
    popularModels = [
        // Chat models
        { name: 'llama3.1:8b', description: 'Meta Llama 3.1 8B - Excellent general purpose model', family: 'llama', parameterSize: '8B', minRAM: 8, category: 'chat', popularity: 95, downloadSizeGB: 4.7, diskSizeGB: 4.7 },
        { name: 'llama3.1:70b', description: 'Meta Llama 3.1 70B - High-performance large model', family: 'llama', parameterSize: '70B', minRAM: 64, category: 'chat', popularity: 90, downloadSizeGB: 40.0, diskSizeGB: 40.0 },
        { name: 'mistral:7b', description: 'Mistral 7B - Fast and efficient', family: 'mistral', parameterSize: '7B', minRAM: 8, category: 'chat', popularity: 88, downloadSizeGB: 4.1, diskSizeGB: 4.1 },
        { name: 'gemma2:9b', description: 'Google Gemma 2 9B - Balanced performance', family: 'gemma', parameterSize: '9B', minRAM: 8, category: 'chat', popularity: 85, downloadSizeGB: 5.4, diskSizeGB: 5.4 },
        { name: 'phi3:3.8b', description: 'Microsoft Phi-3 3.8B - Small but capable', family: 'phi', parameterSize: '3.8B', minRAM: 4, category: 'chat', popularity: 80, downloadSizeGB: 2.2, diskSizeGB: 2.2 },
        // Code models
        { name: 'deepseek-coder:6.7b', description: 'DeepSeek Coder 6.7B - Excellent for coding', family: 'deepseek', parameterSize: '6.7B', minRAM: 8, category: 'code', popularity: 92, downloadSizeGB: 3.8, diskSizeGB: 3.8 },
        { name: 'codellama:7b', description: 'Code Llama 7B - Meta\'s coding model', family: 'llama', parameterSize: '7B', minRAM: 8, category: 'code', popularity: 88, downloadSizeGB: 3.8, diskSizeGB: 3.8 },
        { name: 'codegemma:7b', description: 'Google CodeGemma 7B - Code generation', family: 'gemma', parameterSize: '7B', minRAM: 8, category: 'code', popularity: 82, downloadSizeGB: 5.0, diskSizeGB: 5.0 },
        // Reasoning models
        { name: 'deepseek-r1:8b', description: 'DeepSeek R1 8B - Advanced reasoning', family: 'deepseek', parameterSize: '8B', minRAM: 8, category: 'reasoning', popularity: 89, downloadSizeGB: 4.9, diskSizeGB: 4.9 },
        { name: 'deepseek-r1:14b', description: 'DeepSeek R1 14B - Large reasoning model', family: 'deepseek', parameterSize: '14B', minRAM: 16, category: 'reasoning', popularity: 87, downloadSizeGB: 8.1, diskSizeGB: 8.1 },
        { name: 'qwq:32b', description: 'QwQ 32B - Mathematical reasoning', family: 'qwen', parameterSize: '32B', minRAM: 32, category: 'reasoning', popularity: 84, downloadSizeGB: 20.0, diskSizeGB: 20.0 },
        // Vision models
        { name: 'llava:7b', description: 'LLaVA 7B - Vision-language model', family: 'llava', parameterSize: '7B', minRAM: 8, category: 'vision', popularity: 86, downloadSizeGB: 4.5, diskSizeGB: 4.5 },
        { name: 'llava:13b', description: 'LLaVA 13B - Large vision model', family: 'llava', parameterSize: '13B', minRAM: 16, category: 'vision', popularity: 83, downloadSizeGB: 8.0, diskSizeGB: 8.0 },
        // Small/efficient models
        { name: 'gemma:2b', description: 'Google Gemma 2B - Very efficient', family: 'gemma', parameterSize: '2B', minRAM: 4, category: 'chat', popularity: 78, downloadSizeGB: 1.4, diskSizeGB: 1.4 },
        { name: 'gemma3:4b', description: 'Google Gemma 3 4B - Latest Gemma model', family: 'gemma3', parameterSize: '4B', minRAM: 4, category: 'chat', popularity: 82, downloadSizeGB: 3.3, diskSizeGB: 3.3 },
        { name: 'qwen3:latest', description: 'Qwen 3 Latest - Advanced Chinese and English model', family: 'qwen3', parameterSize: '8B', minRAM: 8, category: 'chat', popularity: 85, downloadSizeGB: 5.2, diskSizeGB: 5.2 },
        { name: 'phi:2.7b', description: 'Microsoft Phi 2.7B - Compact model', family: 'phi', parameterSize: '2.7B', minRAM: 4, category: 'chat', popularity: 75, downloadSizeGB: 1.6, diskSizeGB: 1.6 },
    ];
    async getInstalledModels() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            if (!response.ok) {
                throw new Error(`Failed to fetch models: ${response.statusText}`);
            }
            const data = await response.json();
            return data.models.map(model => ({
                name: model.name,
                family: model.details.family || 'unknown',
                parameterSize: model.details.parameter_size || 'unknown',
                sizeGB: model.size / (1024 * 1024 * 1024),
                quantization: model.details.quantization_level || 'unknown',
                isInstalled: true,
                recommendedForRAM: this.getRAMRecommendation(model.details.parameter_size),
            }));
        }
        catch (error) {
            throw new Error(`Failed to get installed models: ${error}`);
        }
    }
    getPopularModels(category) {
        let models = [...this.popularModels];
        if (category) {
            models = models.filter(m => m.category === category);
        }
        return models.sort((a, b) => b.popularity - a.popularity);
    }
    getRecommendedModelsForRAM(ramGB, category) {
        return this.getPopularModels(category)
            .filter(model => model.minRAM <= ramGB)
            .slice(0, 5); // Top 5 recommendations
    }
    async getModelRecommendations(ramGB) {
        const installed = await this.getInstalledModels();
        const allRecommended = this.getRecommendedModelsForRAM(ramGB);
        // Filter out already installed models from recommendations
        const installedNames = new Set(installed.map(m => m.name));
        const canInstall = allRecommended.filter(model => !installedNames.has(model.name));
        return {
            installed,
            recommended: allRecommended,
            canInstall,
        };
    }
    async pullModel(modelName) {
        const response = await fetch(`${this.baseUrl}/api/pull`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: modelName, stream: false }),
        });
        if (!response.ok) {
            throw new Error(`Failed to pull model ${modelName}: ${response.statusText}`);
        }
        await response.json();
    }
    async checkModelExists(modelName) {
        try {
            const installedModels = await this.getInstalledModels();
            return installedModels.some(model => model.name === modelName);
        }
        catch {
            return false;
        }
    }
    getRAMRecommendation(parameterSize) {
        const size = parameterSize.toLowerCase();
        if (size.includes('2b') || size.includes('1.5b'))
            return [1, 2, 3, 4];
        if (size.includes('3b') || size.includes('4b'))
            return [1, 2, 3, 4];
        if (size.includes('7b') || size.includes('8b') || size.includes('9b'))
            return [2, 3, 4];
        if (size.includes('13b') || size.includes('14b') || size.includes('15b'))
            return [3, 4];
        if (size.includes('30b') || size.includes('32b') || size.includes('34b'))
            return [4];
        if (size.includes('70b') || size.includes('72b'))
            return []; // Requires >64GB
        return [2, 3, 4]; // Default for unknown sizes
    }
    // Get trending models (mock implementation - could integrate with Ollama Hub API)
    getTrendingModels() {
        return this.popularModels
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 10);
    }
    // Search models by name or description
    searchModels(query) {
        const searchTerm = query.toLowerCase();
        return this.popularModels.filter(model => model.name.toLowerCase().includes(searchTerm) ||
            model.description.toLowerCase().includes(searchTerm) ||
            model.family.toLowerCase().includes(searchTerm));
    }
    // Get models by category with detailed information
    getModelsByCategory() {
        const categories = this.popularModels.reduce((acc, model) => {
            if (!acc[model.category]) {
                acc[model.category] = [];
            }
            acc[model.category].push(model);
            return acc;
        }, {});
        // Sort each category by popularity
        Object.keys(categories).forEach(category => {
            categories[category].sort((a, b) => b.popularity - a.popularity);
        });
        return categories;
    }
    // Get estimated download size for a model
    getModelDownloadSize(modelName) {
        const model = this.popularModels.find(m => m.name === modelName);
        if (model && model.downloadSizeGB !== undefined && model.diskSizeGB !== undefined) {
            return {
                downloadGB: model.downloadSizeGB,
                diskGB: model.diskSizeGB
            };
        }
        return null;
    }
    // Format size information for display
    formatSizeInfo(sizeGB) {
        if (sizeGB < 1) {
            return `${(sizeGB * 1024).toFixed(0)}MB`;
        }
        else if (sizeGB < 10) {
            return `${sizeGB.toFixed(1)}GB`;
        }
        else {
            return `${sizeGB.toFixed(0)}GB`;
        }
    }
    // Get comprehensive model information including download estimates
    getModelDetails(modelName) {
        return this.popularModels.find(m => m.name === modelName) || null;
    }
    // Calculate total download size for multiple models
    calculateTotalDownloadSize(modelNames) {
        let totalDownloadGB = 0;
        let totalDiskGB = 0;
        const breakdown = [];
        modelNames.forEach(name => {
            const sizeInfo = this.getModelDownloadSize(name);
            if (sizeInfo) {
                totalDownloadGB += sizeInfo.downloadGB;
                totalDiskGB += sizeInfo.diskGB;
                breakdown.push({
                    name,
                    downloadGB: sizeInfo.downloadGB,
                    diskGB: sizeInfo.diskGB
                });
            }
        });
        return { totalDownloadGB, totalDiskGB, breakdown };
    }
    // Calculate download size only for models that aren't already installed
    async calculateDownloadSizeForMissingModels(modelNames) {
        let totalDownloadGB = 0;
        let totalDiskGB = 0;
        const breakdown = [];
        let installedCount = 0;
        let missingCount = 0;
        // Get currently installed models for size information
        const installedModels = await this.getInstalledModels();
        const installedModelMap = new Map(installedModels.map(m => [m.name, m]));
        // Check each model's installation status
        for (const name of modelNames) {
            const installedModel = installedModelMap.get(name);
            const isInstalled = installedModel !== undefined;
            if (isInstalled && installedModel) {
                installedCount++;
                breakdown.push({
                    name,
                    downloadGB: 0, // No download needed
                    diskGB: installedModel.sizeGB,
                    actualSizeGB: installedModel.sizeGB,
                    isInstalled: true
                });
            }
            else {
                missingCount++;
                // Try to get size from our database for estimation
                const sizeInfo = this.getModelDownloadSize(name);
                if (sizeInfo) {
                    totalDownloadGB += sizeInfo.downloadGB;
                    totalDiskGB += sizeInfo.diskGB;
                    breakdown.push({
                        name,
                        downloadGB: sizeInfo.downloadGB,
                        diskGB: sizeInfo.diskGB,
                        isInstalled: false
                    });
                }
                else {
                    // Model not in our database - use heuristic based on name
                    const estimatedSize = this.estimateModelSize(name);
                    if (estimatedSize > 0) {
                        totalDownloadGB += estimatedSize;
                        totalDiskGB += estimatedSize;
                        breakdown.push({
                            name,
                            downloadGB: estimatedSize,
                            diskGB: estimatedSize,
                            isInstalled: false
                        });
                    }
                    else {
                        breakdown.push({
                            name,
                            downloadGB: 0, // Unknown size
                            diskGB: 0,
                            isInstalled: false
                        });
                    }
                }
            }
        }
        return { totalDownloadGB, totalDiskGB, breakdown, installedCount, missingCount };
    }
    // Estimate model size based on name patterns (fallback when not in database)
    estimateModelSize(modelName) {
        const name = modelName.toLowerCase();
        // Extract parameter size from model name
        if (name.includes('70b') || name.includes('72b'))
            return 40.0;
        if (name.includes('30b') || name.includes('32b') || name.includes('34b'))
            return 20.0;
        if (name.includes('13b') || name.includes('14b') || name.includes('15b'))
            return 8.0;
        if (name.includes('7b') || name.includes('8b') || name.includes('9b'))
            return 4.5;
        if (name.includes('3b') || name.includes('4b'))
            return 2.5;
        if (name.includes('1b') || name.includes('2b'))
            return 1.5;
        // Default estimate for unknown models
        return 4.0;
    }
}
//# sourceMappingURL=model-discovery.js.map