# Hardware Detection Improvements

## Overview
This branch implements significant improvements to the model recommendation system, moving from a simple RAM-tier-based approach to a comprehensive hardware-aware scoring system.

## Key Improvements

### 1. GPU Detection and CUDA Support
- Added CUDA detection for NVIDIA GPUs
- Included compute capability mapping for common GPU models
- GPU information now includes CUDA availability and compute capability

### 2. CPU Information Collection
- Added detailed CPU information (manufacturer, brand, cores, speed)
- Included CPU feature flags detection (e.g., AVX2 support)
- Special handling for Apple Silicon optimization

### 3. Available RAM Consideration
- Now uses available RAM instead of just total RAM
- Implements a 2GB system buffer for safer memory allocation
- Calculates "effective RAM" for more accurate model selection

### 4. Model-Specific Memory Requirements
- Added `memoryRequirement` field to each model configuration
- Added optimization flags: `gpuOptimized` and `cpuOptimized`
- Included quantization information for each model

### 5. Hardware Scoring System
New comprehensive scoring system (0-100 points):
- **CPU Score (0-30 points)**:
  - Physical cores: up to 16 points
  - CPU speed: up to 8 points
  - Architecture bonuses: Apple Silicon (+6), AVX2 support (+4)
  
- **GPU Score (0-50 points)**:
  - VRAM: up to 24 points
  - CUDA availability: +20 points
  - Compute capability bonuses: +2 to +6 points
  
- **RAM Score (0-20 points)**:
  - Based on effective available RAM

### 6. Hardware-Aware Model Recommendations
The new `getHardwareAwareRecommendations` method considers:
- Memory requirements vs available RAM
- GPU optimization preferences for CUDA-enabled systems
- CPU optimization preferences for CPU-only systems
- Architecture-specific optimizations (e.g., Apple Silicon)
- Optimal memory utilization (50-80% of available RAM)
- Preference for larger models that fit within constraints

## Implementation Details

### Modified Files
1. **src/modules/system-detection.ts**
   - Enhanced GPU interface with CUDA support
   - Added CPUInfo interface and collection
   - Implemented hardware scoring algorithm
   - Added CUDA detection via nvidia-smi
   - Added compute capability mapping

2. **src/modules/model-tiers.ts**
   - Enhanced ModelConfig interface with memory and optimization fields
   - Added hardware-aware recommendation method
   - Implemented model deduplication
   - Added scoring algorithm for model selection

3. **src/components/BenchmarkRunner.tsx**
   - Updated to use hardware-aware recommendations
   - Integrated hardware scoring into model selection

4. **src/simple-cli.ts**
   - Enhanced 'info' command to display hardware scores
   - Updated to show CPU information and CUDA status
   - Improved model recommendation display with memory requirements

## Usage Example

### Before (RAM Tier Only):
```
Recommended Models:
• gemma2:9b - Google Gemma 2 9B
• mistral:7b - Mistral 7B
• phi4:14b - Microsoft Phi-4 14B
```

### After (Hardware-Aware):
```
Hardware-Aware Recommendations:
1. phi4:14b - Microsoft Phi-4 14B - Advanced reasoning
   Memory: 8.2GB | 🎮 GPU optimized
2. deepseek-r1:14b - DeepSeek R1 14B - Large reasoning model
   Memory: 8.5GB | 🎮 GPU optimized
3. llava:13b - LLaVA 13B - Large multimodal model
   Memory: 7.8GB | 🎮 GPU optimized

Hardware Score: 30.1/100 (CPU: 22.0, GPU: 0.0)
```

## Benefits
1. **More Accurate Recommendations**: Models are selected based on actual hardware capabilities
2. **GPU Utilization**: Prioritizes GPU-optimized models when CUDA is available
3. **Memory Safety**: Uses available RAM with safety buffer
4. **Architecture Awareness**: Optimizes for specific CPU architectures
5. **Better User Experience**: Clear display of why models are recommended

## Future Enhancements
- Dynamic performance testing capability (TODO)
- Model performance benchmarking database
- Real-time memory usage monitoring
- Support for AMD ROCm detection
- Multi-GPU support and load balancing