import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { BenchmarkRunner } from './BenchmarkRunner.js';
import { SystemInfo } from './SystemInfo.js';
import { InteractiveMode } from './InteractiveMode.js';
import { CompareResults } from './CompareResults.js';
import { ConfigManager } from './ConfigManager.js';

export interface AppOptions {
  models?: string[];
  config?: string;
  tier?: number;
  output?: string;
  format?: string;
  iterations?: number;
  concurrency?: number;
  timeout?: number;
  prompts?: string;
  verbose?: boolean;
  warmup?: number;
  baseline?: string;
  current?: string;
  generate?: string;
  validate?: string;
  show?: boolean;
}

interface Props {
  command: 'run' | 'compare' | 'interactive' | 'info' | 'config';
  options: AppOptions;
}

export const OllamaBenchmarkApp: React.FC<Props> = ({ command, options }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up error boundary
    const handleError = (err: Error) => {
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
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red" bold>
          ❌ Error:
        </Text>
        <Text color="red">{error}</Text>
      </Box>
    );
  }

  switch (command) {
    case 'run':
      return <BenchmarkRunner options={options} />;
    
    case 'compare':
      return <CompareResults options={options} />;
    
    case 'interactive':
      return <InteractiveMode />;
    
    case 'info':
      return <SystemInfo verbose={options.verbose || false} />;
    
    case 'config':
      return <ConfigManager options={options} />;
    
    default:
      return (
        <Box flexDirection="column" padding={1}>
          <Text color="red">Unknown command: {command}</Text>
        </Box>
      );
  }
};