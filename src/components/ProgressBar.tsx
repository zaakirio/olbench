import React from 'react';
import { Box, Text } from 'ink';

interface Props {
  current: number;
  total: number;
  width?: number;
}

export const ProgressBar: React.FC<Props> = ({ current, total, width = 40 }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const filledWidth = Math.round((percentage / 100) * width);
  const emptyWidth = width - filledWidth;

  const filled = '█'.repeat(filledWidth);
  const empty = '░'.repeat(emptyWidth);

  return (
    <Box flexDirection="column">
      <Box>
        <Text color="green">{filled}</Text>
        <Text color="gray">{empty}</Text>
        <Text> {percentage.toFixed(1)}%</Text>
      </Box>
      <Text color="gray">
        {current} / {total} completed
      </Text>
    </Box>
  );
};