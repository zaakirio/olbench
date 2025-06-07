import React from 'react';
import { Box, Text } from 'ink';
export const ResultsTable = ({ results }) => {
    const headers = ['Model', 'Tokens/sec', 'First Token (ms)', 'Total Time (ms)', 'Memory (MB)', 'Quality Score'];
    const columnWidths = [20, 12, 16, 16, 12, 14];
    const renderRow = (cells, isHeader = false) => (React.createElement(Box, { key: cells.join('-') }, cells.map((cell, index) => (React.createElement(Box, { key: index, width: columnWidths[index], paddingRight: 1 },
        React.createElement(Text, { bold: isHeader, color: isHeader ? 'blue' : undefined }, cell.padEnd(columnWidths[index] - 1).substring(0, columnWidths[index] - 1)))))));
    const tableData = results.map(result => [
        result.model,
        result.tokensPerSecond.toFixed(1),
        result.firstTokenLatency.toFixed(0),
        result.totalLatency.toFixed(0),
        result.memoryUsage.averageMemoryUsage.toFixed(1),
        (result.quality.consistency * result.quality.completionRate / 100).toFixed(1),
    ]);
    return (React.createElement(Box, { flexDirection: "column", marginY: 1 },
        React.createElement(Text, { bold: true, underline: true, color: "blue" }, "Detailed Results:"),
        React.createElement(Box, { flexDirection: "column", marginTop: 1 },
            renderRow(headers, true),
            React.createElement(Box, null,
                React.createElement(Text, null, '─'.repeat(columnWidths.reduce((a, b) => a + b, 0)))),
            tableData.map((row, index) => renderRow(row)))));
};
//# sourceMappingURL=ResultsTable.js.map