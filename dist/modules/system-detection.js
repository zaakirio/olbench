import si from 'systeminformation';
export class SystemDetector {
    async detectSystem() {
        try {
            // Get system information
            const [mem, osInfo, system, graphics, cpu] = await Promise.all([
                si.mem(),
                si.osInfo(),
                si.system(),
                si.graphics(),
                si.cpu(),
            ]);
            // Convert bytes to GB
            const totalRAM = Math.round(mem.total / (1024 * 1024 * 1024));
            const availableRAM = Math.round(mem.available / (1024 * 1024 * 1024));
            // Process GPU information with CUDA detection
            const gpus = await Promise.all(graphics.controllers.map(async (gpu) => {
                const gpuInfo = {
                    vendor: gpu.vendor || 'Unknown',
                    model: gpu.model || 'Unknown',
                    vram: gpu.vram || 0,
                    driver: gpu.driverVersion || 'Unknown',
                };
                // Check for NVIDIA CUDA support
                if (gpu.vendor?.toLowerCase().includes('nvidia')) {
                    gpuInfo.cudaAvailable = await this.checkCudaSupport();
                    if (gpu.model) {
                        gpuInfo.computeCapability = this.getComputeCapability(gpu.model);
                    }
                }
                return gpuInfo;
            }));
            // Process CPU information
            const cpuInfo = {
                manufacturer: cpu.manufacturer,
                brand: cpu.brand,
                cores: cpu.cores,
                physicalCores: cpu.physicalCores,
                speed: cpu.speed,
                flags: Array.isArray(cpu.flags) ? cpu.flags : [],
            };
            // Check Ollama availability
            const ollamaInfo = await this.checkOllama();
            return {
                totalRAM,
                availableRAM,
                os: osInfo.platform,
                architecture: osInfo.arch,
                gpus,
                cpu: cpuInfo,
                ollamaVersion: ollamaInfo.version,
                ollamaAvailable: ollamaInfo.available,
            };
        }
        catch (error) {
            throw new Error(`Failed to detect system: ${error}`);
        }
    }
    async checkOllama() {
        try {
            // Use native fetch API (available in Node.js 18+)
            const response = await fetch('http://localhost:11434/api/version');
            if (!response.ok) {
                return { available: false, version: null };
            }
            const data = await response.json();
            return { available: true, version: data.version };
        }
        catch (error) {
            // Ollama is not running or not installed
            return { available: false, version: null };
        }
    }
    async ensureOllamaRunning() {
        const maxRetries = 5;
        const retryDelay = 2000; // 2 seconds
        for (let i = 0; i < maxRetries; i++) {
            const ollamaInfo = await this.checkOllama();
            if (ollamaInfo.available) {
                return true;
            }
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
        return false;
    }
    async checkCudaSupport() {
        try {
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);
            // Try to detect CUDA using nvidia-smi
            const { stdout } = await execAsync('nvidia-smi --query-gpu=compute_cap --format=csv,noheader', {
                timeout: 5000
            });
            return stdout.trim().length > 0;
        }
        catch {
            return false;
        }
    }
    getComputeCapability(model) {
        // Map common NVIDIA GPU models to compute capabilities
        const computeCapMap = {
            // RTX 40 series
            '4090': '8.9', '4080': '8.9', '4070': '8.9', '4060': '8.9',
            // RTX 30 series
            '3090': '8.6', '3080': '8.6', '3070': '8.6', '3060': '8.6',
            // RTX 20 series
            '2080': '7.5', '2070': '7.5', '2060': '7.5',
            // GTX 16 series
            '1660': '7.5', '1650': '7.5',
            // GTX 10 series
            '1080': '6.1', '1070': '6.1', '1060': '6.1',
            // Professional cards
            'A100': '8.0', 'A6000': '8.6', 'V100': '7.0', 'T4': '7.5',
        };
        // Extract model number from string
        for (const [key, value] of Object.entries(computeCapMap)) {
            if (model.includes(key)) {
                return value;
            }
        }
        return '5.0'; // Default minimum for CUDA
    }
    getRAMTier(totalRAM) {
        if (totalRAM >= 32)
            return 4;
        if (totalRAM >= 16)
            return 3;
        if (totalRAM >= 8)
            return 2;
        if (totalRAM >= 4)
            return 1;
        return 0; // Not enough RAM
    }
    // Get effective available RAM for model loading (leaving 2GB for system)
    getEffectiveRAM(availableRAM) {
        const systemBuffer = 2; // Reserve 2GB for system
        return Math.max(0, availableRAM - systemBuffer);
    }
    // Calculate hardware score for model recommendations
    getHardwareScore(info) {
        const effectiveRAM = this.getEffectiveRAM(info.availableRAM);
        // CPU scoring (0-30 points)
        let cpuScore = 0;
        cpuScore += Math.min(info.cpu.physicalCores * 2, 16); // Up to 16 points for cores
        cpuScore += Math.min(info.cpu.speed / 1000, 4) * 2; // Up to 8 points for speed
        // Architecture bonus
        if (info.architecture === 'arm64' && info.os === 'darwin') {
            cpuScore += 6; // Apple Silicon bonus
        }
        else if (info.cpu.flags.includes('avx2')) {
            cpuScore += 4; // AVX2 support bonus
        }
        // GPU scoring (0-50 points)
        let gpuScore = 0;
        let hasCUDA = false;
        const hasGPU = info.gpus.length > 0;
        if (hasGPU) {
            const bestGPU = info.gpus.reduce((best, gpu) => gpu.vram > (best?.vram || 0) ? gpu : best);
            if (bestGPU) {
                // VRAM scoring
                gpuScore += Math.min(bestGPU.vram / 1024, 24); // Up to 24 points for VRAM (24GB max)
                // CUDA bonus
                if (bestGPU.cudaAvailable) {
                    hasCUDA = true;
                    gpuScore += 20; // CUDA availability bonus
                    // Compute capability bonus
                    const computeCap = parseFloat(bestGPU.computeCapability || '0');
                    if (computeCap >= 8.0)
                        gpuScore += 6; // Modern GPU
                    else if (computeCap >= 7.0)
                        gpuScore += 4; // Recent GPU
                    else if (computeCap >= 6.0)
                        gpuScore += 2; // Older but capable
                }
            }
        }
        // RAM scoring (0-20 points)
        const ramScore = Math.min(effectiveRAM * 0.625, 20); // Up to 20 points for 32GB
        const totalScore = cpuScore + gpuScore + ramScore;
        return {
            score: totalScore,
            hasGPU,
            hasCUDA,
            effectiveRAM,
            cpuScore,
            gpuScore,
        };
    }
    formatSystemInfo(info) {
        const hwScore = this.getHardwareScore(info);
        const lines = [
            `System Information:`,
            `  OS: ${info.os} (${info.architecture})`,
            `  CPU: ${info.cpu.brand} (${info.cpu.physicalCores} cores @ ${info.cpu.speed}GHz)`,
            `  Total RAM: ${info.totalRAM}GB`,
            `  Available RAM: ${info.availableRAM}GB (${hwScore.effectiveRAM}GB effective)`,
            `  RAM Tier: ${this.getRAMTier(info.totalRAM)}`,
        ];
        if (info.gpus.length > 0) {
            lines.push(`  GPUs:`);
            info.gpus.forEach((gpu, index) => {
                let gpuLine = `    ${index + 1}. ${gpu.vendor} ${gpu.model} (${gpu.vram}MB VRAM)`;
                if (gpu.cudaAvailable) {
                    gpuLine += ` - CUDA ${gpu.computeCapability}`;
                }
                lines.push(gpuLine);
            });
        }
        else {
            lines.push(`  GPUs: None detected`);
        }
        lines.push(`  Hardware Score: ${hwScore.score.toFixed(1)}/100 (CPU: ${hwScore.cpuScore.toFixed(1)}, GPU: ${hwScore.gpuScore.toFixed(1)})`);
        lines.push(`  Ollama: ${info.ollamaAvailable ? `v${info.ollamaVersion}` : 'Not detected'}`);
        return lines.join('\\n');
    }
}
//# sourceMappingURL=system-detection.js.map