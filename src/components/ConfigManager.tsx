import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { ConfigManager as Manager } from '../modules/config-manager.js';
import { AppOptions } from './App.js';

interface Props {
  options: AppOptions;
}

export const ConfigManager: React.FC<Props> = ({ options }) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleConfigCommand();
  }, []);

  const handleConfigCommand = async () => {
    try {
      const manager = new Manager();

      if (options.generate) {
        await manager.generateSampleConfig(options.generate);
        setResult(`Sample configuration generated at: ${options.generate}`);
      } else if (options.validate) {
        await manager.loadConfig(options.validate);
        const config = manager.getConfig();
        const validation = manager.validateConfig(config);
        
        if (validation.valid) {
          setResult(`✅ Configuration is valid: ${options.validate}`);
        } else {
          setError(`❌ Configuration validation failed:\\n${validation.errors.join('\\n')}`);
        }
      } else if (options.show) {
        await manager.loadConfig();
        const config = manager.getConfig();
        setResult(JSON.stringify(config, null, 2));
      } else {
        setError('No config command specified. Use --generate, --validate, or --show');
      }

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
        <Text> Processing configuration...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red" bold>❌ Configuration Error</Text>
        <Text color="red">{error}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="blue" underline>
        ⚙️ Configuration Manager
      </Text>

      {result && (
        <Box flexDirection="column" marginY={1}>
          {options.show ? (
            <Box flexDirection="column">
              <Text bold>Current Configuration:</Text>
              <Text>{result}</Text>
            </Box>
          ) : (
            <Text color="green">{result}</Text>
          )}
        </Box>
      )}

      <Box marginY={1}>
        <Text color="gray">
          Available commands:
        </Text>
      </Box>
      <Box flexDirection="column" marginLeft={2}>
        <Text>• <Text color="cyan">--generate &lt;path&gt;</Text> - Generate sample config</Text>
        <Text>• <Text color="cyan">--validate &lt;path&gt;</Text> - Validate config file</Text>
        <Text>• <Text color="cyan">--show</Text> - Show current configuration</Text>
      </Box>
    </Box>
  );
};