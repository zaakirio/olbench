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
}
interface Props {
    command: 'run' | 'compare' | 'interactive' | 'info' | 'config';
    options: AppOptions;
}
export declare const OllamaBenchmarkApp: React.FC<Props>;
export {};
//# sourceMappingURL=App.d.ts.map