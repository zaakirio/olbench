import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { ResultsProcessor } from '../modules/results-processor.js';
import * as fs from 'fs/promises';
export const CompareResults = ({ options }) => {
    const [loading, setLoading] = useState(true);
    const [comparison, setComparison] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        compareResults();
    }, []);
    const compareResults = async () => {
        try {
            if (!options.baseline || !options.current) {
                throw new Error('Both --baseline and --current file paths are required');
            }
            // Load baseline results
            const baselineContent = await fs.readFile(options.baseline, 'utf-8');
            const baselineReport = JSON.parse(baselineContent);
            // Load current results
            const currentContent = await fs.readFile(options.current, 'utf-8');
            const currentReport = JSON.parse(currentContent);
            // Compare results
            const processor = new ResultsProcessor();
            const comparisonReport = processor.compareReports(baselineReport, currentReport);
            setComparison(comparisonReport);
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
            React.createElement(Text, null, " Comparing benchmark results...")));
    }
    if (error) {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "red", bold: true }, "\u274C Comparison Failed"),
            React.createElement(Text, { color: "red" }, error)));
    }
    if (!comparison) {
        return (React.createElement(Box, null,
            React.createElement(Text, { color: "red" }, "Failed to generate comparison")));
    }
    const formatChange = (change, isInverse = false) => {
        const adjusted = isInverse ? -change : change;
        const color = adjusted > 0 ? 'green' : adjusted < 0 ? 'red' : 'yellow';
        const symbol = adjusted > 0 ? '↗' : adjusted < 0 ? '↘' : '→';
        return React.createElement(Text, { color: color },
            symbol,
            " ",
            Math.abs(adjusted).toFixed(1),
            "%");
    };
    return (React.createElement(Box, { flexDirection: "column", padding: 1 },
        React.createElement(Text, { bold: true, color: "blue", underline: true }, "\uD83D\uDCCA Benchmark Comparison Results"),
        React.createElement(Box, { flexDirection: "column", marginY: 1 },
            React.createElement(Text, { bold: true }, "Overview:"),
            React.createElement(Text, null,
                "\u2022 Baseline: ",
                comparison.baseline.timestamp.toISOString().split('T')[0],
                " (",
                comparison.baseline.totalModels,
                " models)"),
            React.createElement(Text, null,
                "\u2022 Current: ",
                comparison.current.timestamp.toISOString().split('T')[0],
                " (",
                comparison.current.totalModels,
                " models)"),
            React.createElement(Text, null,
                "\u2022 Models compared: ",
                comparison.summary.modelsCompared)),
        React.createElement(Box, { flexDirection: "column", marginY: 1 },
            React.createElement(Text, { bold: true }, "Summary Changes:"),
            React.createElement(Text, null,
                "\u2022 Average speed improvement: ",
                formatChange(comparison.summary.averageSpeedImprovement)),
            React.createElement(Text, null,
                "\u2022 Average latency improvement: ",
                formatChange(comparison.summary.averageLatencyImprovement, true))),
        React.createElement(Box, { flexDirection: "column", marginY: 1 },
            React.createElement(Text, { bold: true, underline: true }, "Detailed Model Comparisons:"),
            comparison.comparisons.map((comp, index) => (React.createElement(Box, { key: index, flexDirection: "column", marginLeft: 2, marginY: 1, borderStyle: "round", padding: 1 },
                React.createElement(Text, { bold: true, color: "cyan" }, comp.model),
                React.createElement(Box, { flexDirection: "row", justifyContent: "space-between" },
                    React.createElement(Text, null, "Tokens/sec:"),
                    React.createElement(Box, null,
                        React.createElement(Text, null,
                            comp.tokensPerSecond.baseline.toFixed(1),
                            " \u2192 ",
                            comp.tokensPerSecond.current.toFixed(1),
                            " "),
                        formatChange(comp.tokensPerSecond.change))),
                React.createElement(Box, { flexDirection: "row", justifyContent: "space-between" },
                    React.createElement(Text, null, "First token latency:"),
                    React.createElement(Box, null,
                        React.createElement(Text, null,
                            comp.firstTokenLatency.baseline.toFixed(0),
                            "ms \u2192 ",
                            comp.firstTokenLatency.current.toFixed(0),
                            "ms "),
                        formatChange(comp.firstTokenLatency.change, true))),
                React.createElement(Box, { flexDirection: "row", justifyContent: "space-between" },
                    React.createElement(Text, null, "Memory usage:"),
                    React.createElement(Box, null,
                        React.createElement(Text, null,
                            comp.memoryUsage.baseline.toFixed(1),
                            "MB \u2192 ",
                            comp.memoryUsage.current.toFixed(1),
                            "MB "),
                        formatChange(comp.memoryUsage.change, true))))))),
        options.output && (React.createElement(Box, { marginY: 1 },
            React.createElement(Text, { color: "green" },
                "\u2705 Comparison saved to: ",
                options.output)))));
};
//# sourceMappingURL=CompareResults.js.map