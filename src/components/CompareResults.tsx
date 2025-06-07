import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { ResultsProcessor, BenchmarkReport, ComparisonReport } from '../modules/results-processor.js';
import { AppOptions } from './App.js';
import * as fs from 'fs/promises';

interface Props {
  options: AppOptions;
}

export const CompareResults: React.FC<Props> = ({ options }) => {
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState<ComparisonReport | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const baselineReport: BenchmarkReport = JSON.parse(baselineContent);

      // Load current results
      const currentContent = await fs.readFile(options.current, 'utf-8');
      const currentReport: BenchmarkReport = JSON.parse(currentContent);

      // Compare results
      const processor = new ResultsProcessor();
      const comparisonReport = processor.compareReports(baselineReport, currentReport);

      setComparison(comparisonReport);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Spinner type="dots" />
        <Text> Comparing benchmark results...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red" bold>❌ Comparison Failed</Text>
        <Text color="red">{error}</Text>
      </Box>
    );
  }

  if (!comparison) {
    return (
      <Box>
        <Text color="red">Failed to generate comparison</Text>
      </Box>
    );
  }

  const formatChange = (change: number, isInverse = false) => {
    const adjusted = isInverse ? -change : change;
    const color = adjusted > 0 ? 'green' : adjusted < 0 ? 'red' : 'yellow';
    const symbol = adjusted > 0 ? '↗' : adjusted < 0 ? '↘' : '→';
    return <Text color={color}>{symbol} {Math.abs(adjusted).toFixed(1)}%</Text>;
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="blue" underline>
        📊 Benchmark Comparison Results
      </Text>

      <Box flexDirection="column" marginY={1}>
        <Text bold>Overview:</Text>
        <Text>• Baseline: {comparison.baseline.timestamp.toISOString().split('T')[0]} ({comparison.baseline.totalModels} models)</Text>
        <Text>• Current: {comparison.current.timestamp.toISOString().split('T')[0]} ({comparison.current.totalModels} models)</Text>
        <Text>• Models compared: {comparison.summary.modelsCompared}</Text>
      </Box>

      <Box flexDirection="column" marginY={1}>
        <Text bold>Summary Changes:</Text>
        <Text>• Average speed improvement: {formatChange(comparison.summary.averageSpeedImprovement)}</Text>
        <Text>• Average latency improvement: {formatChange(comparison.summary.averageLatencyImprovement, true)}</Text>
      </Box>

      <Box flexDirection="column" marginY={1}>
        <Text bold underline>Detailed Model Comparisons:</Text>
        {comparison.comparisons.map((comp, index) => (
          <Box key={index} flexDirection="column" marginLeft={2} marginY={1} borderStyle="round" padding={1}>
            <Text bold color="cyan">{comp.model}</Text>
            
            <Box flexDirection="row" justifyContent="space-between">
              <Text>Tokens/sec:</Text>
              <Box>
                <Text>{comp.tokensPerSecond.baseline.toFixed(1)} → {comp.tokensPerSecond.current.toFixed(1)} </Text>
                {formatChange(comp.tokensPerSecond.change)}
              </Box>
            </Box>

            <Box flexDirection="row" justifyContent="space-between">
              <Text>First token latency:</Text>
              <Box>
                <Text>{comp.firstTokenLatency.baseline.toFixed(0)}ms → {comp.firstTokenLatency.current.toFixed(0)}ms </Text>
                {formatChange(comp.firstTokenLatency.change, true)}
              </Box>
            </Box>

            <Box flexDirection="row" justifyContent="space-between">
              <Text>Memory usage:</Text>
              <Box>
                <Text>{comp.memoryUsage.baseline.toFixed(1)}MB → {comp.memoryUsage.current.toFixed(1)}MB </Text>
                {formatChange(comp.memoryUsage.change, true)}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {options.output && (
        <Box marginY={1}>
          <Text color="green">✅ Comparison saved to: {options.output}</Text>
        </Box>
      )}
    </Box>
  );
};