import React, { useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { BenchmarkRunner } from './BenchmarkRunner.js';
import { SystemInfo } from './SystemInfo.js';
export const InteractiveMode = () => {
    const [currentStep, setCurrentStep] = useState('menu');
    const [benchmarkOptions, setBenchmarkOptions] = useState({});
    const menuItems = [
        { label: '🚀 Run Benchmark', value: 'run-benchmark' },
        { label: '🖥️  System Information', value: 'system-info' },
        { label: '⚙️  Configure Settings', value: 'configure' },
        { label: '🚪 Exit', value: 'exit' },
    ];
    const handleMenuSelect = (item) => {
        if (item.value === 'exit') {
            process.exit(0);
        }
        setCurrentStep(item.value);
    };
    const handleBackToMenu = () => {
        setCurrentStep('menu');
    };
    if (currentStep === 'menu') {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { bold: true, color: "blue", underline: true }, "\uD83C\uDFAF Ollama Benchmark - Interactive Mode"),
            React.createElement(Box, { marginY: 1 },
                React.createElement(Text, null, "Select an option:")),
            React.createElement(SelectInput, { items: menuItems, onSelect: handleMenuSelect }),
            React.createElement(Box, { marginTop: 2 },
                React.createElement(Text, { color: "gray" }, "Use arrow keys to navigate, Enter to select"))));
    }
    if (currentStep === 'run-benchmark') {
        return (React.createElement(Box, { flexDirection: "column" },
            React.createElement(BenchmarkRunner, { options: benchmarkOptions }),
            React.createElement(Box, { marginTop: 2 },
                React.createElement(Text, { color: "gray" }, "Press Ctrl+C to return to menu"))));
    }
    if (currentStep === 'system-info') {
        return (React.createElement(Box, { flexDirection: "column" },
            React.createElement(SystemInfo, { verbose: true }),
            React.createElement(Box, { marginTop: 2 },
                React.createElement(Text, { color: "gray" }, "Press Ctrl+C to return to menu"))));
    }
    if (currentStep === 'configure') {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { bold: true, color: "blue" }, "\u2699\uFE0F  Configuration"),
            React.createElement(Text, { color: "gray" }, "Configuration interface coming soon..."),
            React.createElement(Box, { marginTop: 2 },
                React.createElement(Text, { color: "gray" }, "Press Ctrl+C to return to menu"))));
    }
    return (React.createElement(Box, null,
        React.createElement(Text, { color: "red" },
            "Unknown step: ",
            currentStep)));
};
//# sourceMappingURL=InteractiveMode.js.map