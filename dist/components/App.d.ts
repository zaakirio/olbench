import React from 'react';
export interface AppOptions {
    models?: string[];
    config?: string;
    tier?: number;
    output?: string;
    format?: string;
    iterations?: number;
    concurrency?: number;
    timeout?: number;
    prompts?: string;
    verbose?: boolean;
    warmup?: number;
    baseline?: string;
    current?: string;
    generate?: string;
    validate?: string;
    show?: boolean;
    category?: string;
    search?: string;
    trending?: boolean;
    pull?: string;
    installed?: boolean;
    size?: string;
}
interface Props {
    command: 'run' | 'compare' | 'interactive' | 'info' | 'config' | 'discover';
    options: AppOptions;
}
export declare const OllamaBenchmarkApp: React.FC<Props>;
export {};
//# sourceMappingURL=App.d.ts.map