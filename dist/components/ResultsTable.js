import React from 'react';
import { Box, Text } from 'ink';
// @ts-ignore
import Table from 'ink-table';
export const ResultsTable = ({ results }) => {
    const tableData = results.map(result => ({
        Model: result.model,
        'Tokens/sec': result.tokensPerSecond.toFixed(1),
        'First Token (ms)': result.firstTokenLatency.toFixed(0),
        'Total Time (ms)': result.totalLatency.toFixed(0),
        'Memory (MB)': result.memoryUsage.averageMemoryUsage.toFixed(1),
        'Quality Score': (result.quality.consistency * result.quality.completionRate / 100).toFixed(1),
    }));
    return (React.createElement(Box, { flexDirection: "column", marginY: 1 },
        React.createElement(Text, { bold: true, underline: true, color: "blue" }, "Detailed Results:"),
        React.createElement(Table, { data: tableData })));
};
//# sourceMappingURL=ResultsTable.js.map