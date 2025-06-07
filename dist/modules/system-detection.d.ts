export interface GPU {
    vendor: string;
    model: string;
    vram: number;
    driver: string;
}
export interface SystemInfo {
    totalRAM: number;
    availableRAM: number;
    os: string;
    architecture: string;
    gpus: GPU[];
    ollamaVersion: string | null;
    ollamaAvailable: boolean;
}
export declare class SystemDetector {
    detectSystem(): Promise<SystemInfo>;
    private checkOllama;
    ensureOllamaRunning(): Promise<boolean>;
    getRAMTier(totalRAM: number): number;
    formatSystemInfo(info: SystemInfo): string;
}
//# sourceMappingURL=system-detection.d.ts.map