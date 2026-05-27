/**
 * Resolve the Ollama base URL.
 *
 * Honours the standard `OLLAMA_HOST` environment variable (the same one the
 * Ollama CLI uses), accepting values with or without a scheme:
 *   - `http://127.0.0.1:11434`
 *   - `127.0.0.1:11434`
 *   - `localhost`
 *
 * Falls back to `http://localhost:11434` when unset.
 */
export declare function getOllamaBaseUrl(): string;
//# sourceMappingURL=ollama.d.ts.map