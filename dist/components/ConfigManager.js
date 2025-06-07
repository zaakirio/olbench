import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { ConfigManager as Manager } from '../modules/config-manager.js';
export const ConfigManager = ({ options }) => {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        handleConfigCommand();
    }, []);
    const handleConfigCommand = async () => {
        try {
            const manager = new Manager();
            if (options.generate) {
                await manager.generateSampleConfig(options.generate);
                setResult(`Sample configuration generated at: ${options.generate}`);
            }
            else if (options.validate) {
                await manager.loadConfig(options.validate);
                const config = manager.getConfig();
                const validation = manager.validateConfig(config);
                if (validation.valid) {
                    setResult(`✅ Configuration is valid: ${options.validate}`);
                }
                else {
                    setError(`❌ Configuration validation failed:\\n${validation.errors.join('\\n')}`);
                }
            }
            else if (options.show) {
                await manager.loadConfig();
                const config = manager.getConfig();
                setResult(JSON.stringify(config, null, 2));
            }
            else {
                setError('No config command specified. Use --generate, --validate, or --show');
            }
            setLoading(false);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setLoading(false);
        }
    };
    if (loading) {
        return (React.createElement(Box, null,
            React.createElement(Spinner, { type: "dots" }),
            React.createElement(Text, null, " Processing configuration...")));
    }
    if (error) {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "red", bold: true }, "\u274C Configuration Error"),
            React.createElement(Text, { color: "red" }, error)));
    }
    return (React.createElement(Box, { flexDirection: "column", padding: 1 },
        React.createElement(Text, { bold: true, color: "blue", underline: true }, "\u2699\uFE0F Configuration Manager"),
        result && (React.createElement(Box, { flexDirection: "column", marginY: 1 }, options.show ? (React.createElement(Box, { flexDirection: "column" },
            React.createElement(Text, { bold: true }, "Current Configuration:"),
            React.createElement(Text, null, result))) : (React.createElement(Text, { color: "green" }, result)))),
        React.createElement(Box, { marginY: 1 },
            React.createElement(Text, { color: "gray" }, "Available commands:")),
        React.createElement(Box, { flexDirection: "column", marginLeft: 2 },
            React.createElement(Text, null,
                "\u2022 ",
                React.createElement(Text, { color: "cyan" }, "--generate <path>"),
                " - Generate sample config"),
            React.createElement(Text, null,
                "\u2022 ",
                React.createElement(Text, { color: "cyan" }, "--validate <path>"),
                " - Validate config file"),
            React.createElement(Text, null,
                "\u2022 ",
                React.createElement(Text, { color: "cyan" }, "--show"),
                " - Show current configuration"))));
};
//# sourceMappingURL=ConfigManager.js.map