import React, { useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { BenchmarkRunner } from './BenchmarkRunner.js';
import { SystemInfo } from './SystemInfo.js';

type InteractiveStep = 'menu' | 'run-benchmark' | 'system-info' | 'configure' | 'exit';

interface SelectItem {
  label: string;
  value: InteractiveStep;
}

export const InteractiveMode: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<InteractiveStep>('menu');
  const [benchmarkOptions, setBenchmarkOptions] = useState<any>({});

  const menuItems: SelectItem[] = [
    { label: '🚀 Run Benchmark', value: 'run-benchmark' },
    { label: '🖥️  System Information', value: 'system-info' },
    { label: '⚙️  Configure Settings', value: 'configure' },
    { label: '🚪 Exit', value: 'exit' },
  ];

  const handleMenuSelect = (item: SelectItem) => {
    if (item.value === 'exit') {
      process.exit(0);
    }
    setCurrentStep(item.value);
  };

  const handleBackToMenu = () => {
    setCurrentStep('menu');
  };

  if (currentStep === 'menu') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="blue" underline>
          🎯 Ollama Benchmark - Interactive Mode
        </Text>
        
        <Box marginY={1}>
          <Text>Select an option:</Text>
        </Box>

        <SelectInput items={menuItems} onSelect={handleMenuSelect} />

        <Box marginTop={2}>
          <Text color="gray">Use arrow keys to navigate, Enter to select</Text>
        </Box>
      </Box>
    );
  }

  if (currentStep === 'run-benchmark') {
    return (
      <Box flexDirection="column">
        <BenchmarkRunner options={benchmarkOptions} />
        <Box marginTop={2}>
          <Text color="gray">Press Ctrl+C to return to menu</Text>
        </Box>
      </Box>
    );
  }

  if (currentStep === 'system-info') {
    return (
      <Box flexDirection="column">
        <SystemInfo verbose={true} />
        <Box marginTop={2}>
          <Text color="gray">Press Ctrl+C to return to menu</Text>
        </Box>
      </Box>
    );
  }

  if (currentStep === 'configure') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="blue">⚙️  Configuration</Text>
        <Text color="gray">Configuration interface coming soon...</Text>
        <Box marginTop={2}>
          <Text color="gray">Press Ctrl+C to return to menu</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Text color="red">Unknown step: {currentStep}</Text>
    </Box>
  );
};