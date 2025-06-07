import React from 'react';
import { Box, Text } from 'ink';
import { BenchmarkResult } from '../modules/results-processor.js';

interface Props {
  results: BenchmarkResult[];
}

export const ResultsTable: React.FC<Props> = ({ results }) => {
  const headers = ['Model', 'Tokens/sec', 'First Token (ms)', 'Total Time (ms)', 'Memory (MB)', 'Quality Score'];
  const columnWidths = [20, 12, 16, 16, 12, 14];

  const renderRow = (cells: string[], isHeader = false) => (
    <Box key={cells.join('-')}>
      {cells.map((cell, index) => (
        <Box key={index} width={columnWidths[index]} paddingRight={1}>
          <Text bold={isHeader} color={isHeader ? 'blue' : undefined}>
            {cell.padEnd(columnWidths[index] - 1).substring(0, columnWidths[index] - 1)}
          </Text>
        </Box>
      ))}
    </Box>
  );

  const tableData = results.map(result => [
    result.model,
    result.tokensPerSecond.toFixed(1),
    result.firstTokenLatency.toFixed(0),
    result.totalLatency.toFixed(0),
    result.memoryUsage.averageMemoryUsage.toFixed(1),
    (result.quality.consistency * result.quality.completionRate / 100).toFixed(1),
  ]);

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold underline color="blue">
        Detailed Results:
      </Text>
      <Box flexDirection="column" marginTop={1}>
        {renderRow(headers, true)}
        <Box>
          <Text>{'─'.repeat(columnWidths.reduce((a, b) => a + b, 0))}</Text>
        </Box>
        {tableData.map((row, index) => renderRow(row))}
      </Box>
    </Box>
  );
};