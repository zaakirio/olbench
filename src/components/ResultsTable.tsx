import React from 'react';
import { Box, Text } from 'ink';
// @ts-ignore
import Table from 'ink-table';
import { BenchmarkResult } from '../modules/results-processor.js';

interface Props {
  results: BenchmarkResult[];
}

export const ResultsTable: React.FC<Props> = ({ results }) => {
  const tableData = results.map(result => ({
    Model: result.model,
    'Tokens/sec': result.tokensPerSecond.toFixed(1),
    'First Token (ms)': result.firstTokenLatency.toFixed(0),
    'Total Time (ms)': result.totalLatency.toFixed(0),
    'Memory (MB)': result.memoryUsage.averageMemoryUsage.toFixed(1),
    'Quality Score': (result.quality.consistency * result.quality.completionRate / 100).toFixed(1),
  }));

  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold underline color="blue">
        Detailed Results:
      </Text>
      {/* @ts-ignore */}
      <Table data={tableData} />
    </Box>
  );
};