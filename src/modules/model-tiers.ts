export interface ModelConfig {
  name: string;
  priority: number;
  description?: string;
  contextLength?: number;
  parameters?: string;
  memoryRequirement: number; // in GB
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

export const MODEL_TIERS: ModelTier[] = [
  {
    name: 'Tier 1 (4GB-7GB)',
    ramRange: [4, 7],
    priority: 1,
    models: [
      { 
        name: 'deepseek-r1:1.5b', 
        priority: 1, 
        description: 'DeepSeek R1 1.5B - Lightweight reasoning model',
        memoryRequirement: 1.2,
        cpuOptimized: true,
        quantization: 'Q4_0'
      },
      { 
        name: 'gemma:2b', 
        priority: 2, 
        description: 'Google Gemma 2B - Efficient small model',
        memoryRequirement: 1.5,
        cpuOptimized: true,
        quantization: 'Q4_0'
      },
      { 
        name: 'phi:2.7b', 
        priority: 3, 
        description: 'Microsoft Phi 2.7B - Small but capable',
        memoryRequirement: 2.0,
        cpuOptimized: true,
        quantization: 'Q4_0'
      },
      { 
        name: 'phi3:3.8b', 
        priority: 4, 
        description: 'Microsoft Phi-3 3.8B - Enhanced small model',
        memoryRequirement: 2.8,
        cpuOptimized: true,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
    ],
  },
  {
    name: 'Tier 2 (8GB-15GB)',
    ramRange: [8, 15],
    priority: 2,
    models: [
      { 
        name: 'phi3:3.8b', 
        priority: 1, 
        description: 'Microsoft Phi-3 3.8B - Enhanced small model',
        memoryRequirement: 2.8,
        cpuOptimized: true,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
      { 
        name: 'gemma2:9b', 
        priority: 2, 
        description: 'Google Gemma 2 9B - Balanced performance',
        memoryRequirement: 5.5,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
      { 
        name: 'mistral:7b', 
        priority: 3, 
        description: 'Mistral 7B - High-performance medium model',
        memoryRequirement: 4.1,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
      { 
        name: 'llama3.1:8b', 
        priority: 4, 
        description: 'Meta Llama 3.1 8B - Latest Llama model',
        memoryRequirement: 4.7,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
      { 
        name: 'deepseek-r1:8b', 
        priority: 5, 
        description: 'DeepSeek R1 8B - Medium reasoning model',
        memoryRequirement: 4.9,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
      { 
        name: 'llava:7b', 
        priority: 6, 
        description: 'LLaVA 7B - Multimodal vision-language model',
        memoryRequirement: 4.5,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
    ],
  },
  {
    name: 'Tier 3 (16GB-31GB)',
    ramRange: [16, 31],
    priority: 3,
    models: [
      { 
        name: 'gemma2:9b', 
        priority: 1, 
        description: 'Google Gemma 2 9B - Balanced performance',
        memoryRequirement: 5.5,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
      { 
        name: 'mistral:7b', 
        priority: 2, 
        description: 'Mistral 7B - High-performance medium model',
        memoryRequirement: 4.1,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
      { 
        name: 'phi4:14b', 
        priority: 3, 
        description: 'Microsoft Phi-4 14B - Advanced reasoning',
        memoryRequirement: 8.2,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
      { 
        name: 'deepseek-r1:8b', 
        priority: 4, 
        description: 'DeepSeek R1 8B - Medium reasoning model',
        memoryRequirement: 4.9,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
      { 
        name: 'deepseek-r1:14b', 
        priority: 5, 
        description: 'DeepSeek R1 14B - Large reasoning model',
        memoryRequirement: 8.5,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
      { 
        name: 'llava:7b', 
        priority: 6, 
        description: 'LLaVA 7B - Multimodal vision-language model',
        memoryRequirement: 4.5,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
      { 
        name: 'llava:13b', 
        priority: 7, 
        description: 'LLaVA 13B - Large multimodal model',
        memoryRequirement: 7.8,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
    ],
  },
  {
    name: 'Tier 4 (32GB+)',
    ramRange: [32, Infinity],
    priority: 4,
    models: [
      { 
        name: 'phi4:14b', 
        priority: 1, 
        description: 'Microsoft Phi-4 14B - Advanced reasoning',
        memoryRequirement: 8.2,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
      { 
        name: 'deepseek-r1:14b', 
        priority: 2, 
        description: 'DeepSeek R1 14B - Large reasoning model',
        memoryRequirement: 8.5,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
      { 
        name: 'deepseek-r1:32b', 
        priority: 3, 
        description: 'DeepSeek R1 32B - Extra large reasoning model',
        memoryRequirement: 18.9,
        gpuOptimized: true,
        quantization: 'Q4_0'
      },
    ],
  },
];

export class ModelTierManager {
  private tiers: ModelTier[] = MODEL_TIERS;

  getTierByRAM(ramGB: number): ModelTier | null {
    return this.tiers.find(
      tier => ramGB >= tier.ramRange[0] && ramGB <= tier.ramRange[1]
    ) || null;
  }

  getTierByName(tierName: string): ModelTier | null {
    return this.tiers.find(tier => tier.name === tierName) || null;
  }

  getAllTiers(): ModelTier[] {
    return [...this.tiers];
  }

  getModelsForRAM(ramGB: number): ModelConfig[] {
    const tier = this.getTierByRAM(ramGB);
    if (!tier) return [];
    
    // Sort by priority (lower number = higher priority)
    return [...tier.models].sort((a, b) => a.priority - b.priority);
  }

  getModelByName(modelName: string): ModelConfig | null {
    for (const tier of this.tiers) {
      const model = tier.models.find(m => m.name === modelName);
      if (model) return model;
    }
    return null;
  }

  // Get recommended models based on RAM and optional filter
  getRecommendedModels(ramGB: number, count: number = 3): ModelConfig[] {
    const models = this.getModelsForRAM(ramGB);
    return models.slice(0, count);
  }

  // Get hardware-aware recommended models
  getHardwareAwareRecommendations(
    systemInfo: {
      availableRAM: number;
      totalRAM: number;
      hasGPU: boolean;
      hasCUDA: boolean;
      architecture: string;
      os: string;
    },
    count: number = 3
  ): ModelConfig[] {
    // Calculate effective RAM (available - 2GB buffer)
    const effectiveRAM = Math.max(0, systemInfo.availableRAM - 2);
    
    // Get all models that can run with effective RAM (deduplicated)
    const modelMap = new Map<string, ModelConfig>();
    for (const tier of this.tiers) {
      for (const model of tier.models) {
        if (model.memoryRequirement <= effectiveRAM && !modelMap.has(model.name)) {
          modelMap.set(model.name, model);
        }
      }
    }
    const viableModels = Array.from(modelMap.values());

    // Score models based on hardware
    const scoredModels = viableModels.map(model => {
      let score = 100 - model.priority; // Base score (inverse priority)
      
      // GPU scoring
      if (systemInfo.hasCUDA && model.gpuOptimized) {
        score += 50; // Strong preference for GPU-optimized models on CUDA systems
      } else if (systemInfo.hasGPU && model.gpuOptimized) {
        score += 20; // Some preference for GPU models on non-CUDA GPUs
      }
      
      // CPU scoring
      if (!systemInfo.hasGPU && model.cpuOptimized) {
        score += 30; // Prefer CPU-optimized models on CPU-only systems
      }
      
      // Architecture scoring
      if (systemInfo.architecture === 'arm64' && systemInfo.os === 'darwin') {
        // Apple Silicon optimization
        if (model.cpuOptimized) score += 15;
      }
      
      // Memory efficiency scoring
      const memoryUtilization = model.memoryRequirement / effectiveRAM;
      if (memoryUtilization >= 0.5 && memoryUtilization <= 0.8) {
        score += 10; // Optimal memory utilization
      } else if (memoryUtilization < 0.3) {
        score -= 10; // Underutilizing available memory
      }
      
      // Model size bonus (prefer larger models that fit)
      score += Math.log(model.memoryRequirement) * 5;
      
      return { model, score };
    });
    
    // Sort by score and return top models
    scoredModels.sort((a, b) => b.score - a.score);
    return scoredModels.slice(0, count).map(s => s.model);
  }

  // Check if a model is available for given RAM
  isModelAvailable(modelName: string, ramGB: number): boolean {
    const availableModels = this.getModelsForRAM(ramGB);
    return availableModels.some(m => m.name === modelName);
  }

  // Get all unique models across all tiers
  getAllModels(): ModelConfig[] {
    const modelMap = new Map<string, ModelConfig>();
    
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
  formatTierInfo(tier: ModelTier): string {
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