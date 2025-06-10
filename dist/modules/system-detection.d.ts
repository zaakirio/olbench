export interface GPU {
    vendor: string;
    model: string;
    vram: number;
    driver: string;
    cudaAvailable?: boolean;
    computeCapability?: string;
}
export interface CPUInfo {
    manufacturer: string;
    brand: string;
    cores: number;
    physicalCores: number;
    speed: number;
    flags: string[];
}
export interface SystemInfo {
    totalRAM: number;
    availableRAM: number;
    os: string;
    architecture: string;
    gpus: GPU[];
    cpu: CPUInfo;
    ollamaVersion: string | null;
    ollamaAvailable: boolean;
}
export declare class SystemDetector {
    detectSystem(): Promise<SystemInfo>;
    private checkOllama;
    ensureOllamaRunning(): Promise<boolean>;
    private checkCudaSupport;
    private getComputeCapability;
    getRAMTier(totalRAM: number): number;
    getEffectiveRAM(availableRAM: number): number;
    getHardwareScore(info: SystemInfo): {
        score: number;
        hasGPU: boolean;
        hasCUDA: boolean;
        effectiveRAM: number;
        cpuScore: number;
        gpuScore: number;
    };
    formatSystemInfo(info: SystemInfo): string;
}
//# sourceMappingURL=system-detection.d.ts.map