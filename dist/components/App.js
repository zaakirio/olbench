import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { BenchmarkRunner } from './BenchmarkRunner.js';
import { SystemInfo } from './SystemInfo.js';
import { InteractiveMode } from './InteractiveMode.js';
import { CompareResults } from './CompareResults.js';
import { ConfigManager } from './ConfigManager.js';
export const OllamaBenchmarkApp = ({ command, options }) => {
    const [error, setError] = useState(null);
    useEffect(() => {
        // Set up error boundary
        const handleError = (err) => {
            setError(err.message);
        };
        process.on('uncaughtException', handleError);
        process.on('unhandledRejection', (reason) => {
            handleError(new Error(String(reason)));
        });
        return () => {
            process.removeListener('uncaughtException', handleError);
            process.removeListener('unhandledRejection', handleError);
        };
    }, []);
    if (error) {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "red", bold: true }, "\u274C Error:"),
            React.createElement(Text, { color: "red" }, error)));
    }
    switch (command) {
        case 'run':
            return React.createElement(BenchmarkRunner, { options: options });
        case 'compare':
            return React.createElement(CompareResults, { options: options });
        case 'interactive':
            return React.createElement(InteractiveMode, null);
        case 'info':
            return React.createElement(SystemInfo, { verbose: options.verbose || false });
        case 'config':
            return React.createElement(ConfigManager, { options: options });
        default:
            return (React.createElement(Box, { flexDirection: "column", padding: 1 },
                React.createElement(Text, { color: "red" },
                    "Unknown command: ",
                    command)));
    }
};
//# sourceMappingURL=App.js.map