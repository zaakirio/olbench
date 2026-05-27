const DEFAULT_HOST = 'http://localhost:11434';
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
export function getOllamaBaseUrl() {
    const raw = process.env.OLLAMA_HOST?.trim();
    if (!raw) {
        return DEFAULT_HOST;
    }
    const withScheme = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
    try {
        const url = new URL(withScheme);
        // Default to Ollama's port when only a host was provided.
        if (!url.port && !/:\d+$/.test(url.host)) {
            url.port = '11434';
        }
        return url.origin;
    }
    catch {
        return DEFAULT_HOST;
    }
}
//# sourceMappingURL=ollama.js.map