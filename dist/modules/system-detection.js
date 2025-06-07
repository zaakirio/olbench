import si from 'systeminformation';
export class SystemDetector {
    async detectSystem() {
        try {
            // Get system information
            const [mem, osInfo, system, graphics] = await Promise.all([
                si.mem(),
                si.osInfo(),
                si.system(),
                si.graphics(),
            ]);
            // Convert bytes to GB
            const totalRAM = Math.round(mem.total / (1024 * 1024 * 1024));
            const availableRAM = Math.round(mem.available / (1024 * 1024 * 1024));
            // Process GPU information
            const gpus = graphics.controllers.map(gpu => ({
                vendor: gpu.vendor || 'Unknown',
                model: gpu.model || 'Unknown',
                vram: gpu.vram || 0,
                driver: gpu.driverVersion || 'Unknown',
            }));
            // Check Ollama availability
            const ollamaInfo = await this.checkOllama();
            return {
                totalRAM,
                availableRAM,
                os: osInfo.platform,
                architecture: osInfo.arch,
                gpus,
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
    formatSystemInfo(info) {
        const lines = [
            `System Information:`,
            `  OS: ${info.os} (${info.architecture})`,
            `  Total RAM: ${info.totalRAM}GB`,
            `  Available RAM: ${info.availableRAM}GB`,
            `  RAM Tier: ${this.getRAMTier(info.totalRAM)}`,
        ];
        if (info.gpus.length > 0) {
            lines.push(`  GPUs:`);
            info.gpus.forEach((gpu, index) => {
                lines.push(`    ${index + 1}. ${gpu.vendor} ${gpu.model} (${gpu.vram}MB VRAM)`);
            });
        }
        lines.push(`  Ollama: ${info.ollamaAvailable ? `v${info.ollamaVersion}` : 'Not detected'}`);
        return lines.join('\\n');
    }
}
//# sourceMappingURL=system-detection.js.map