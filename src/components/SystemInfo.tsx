import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { SystemDetector, SystemInfo as SystemInfoType } from '../modules/system-detection.js';
import { ModelTierManager } from '../modules/model-tiers.js';

interface Props {
  verbose: boolean;
}

export const SystemInfo: React.FC<Props> = ({ verbose }) => {
  const [loading, setLoading] = useState(true);
  const [systemInfo, setSystemInfo] = useState<SystemInfoType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectSystem();
  }, []);

  const detectSystem = async () => {
    try {
      const detector = new SystemDetector();
      const info = await detector.detectSystem();
      setSystemInfo(info);
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
        <Text> Detecting system information...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red" bold>❌ System Detection Failed</Text>
        <Text color="red">{error}</Text>
      </Box>
    );
  }

  if (!systemInfo) {
    return (
      <Box>
        <Text color="red">Failed to detect system information</Text>
      </Box>
    );
  }

  const detector = new SystemDetector();
  const tierManager = new ModelTierManager();
  const ramTier = detector.getRAMTier(systemInfo.totalRAM);
  const tier = tierManager.getAllTiers().find(t => t.priority === ramTier);
  const recommendedModels = tierManager.getRecommendedModels(systemInfo.totalRAM);

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="blue" underline>
        🖥️  System Information
      </Text>

      <Box flexDirection="column" marginY={1}>
        <Text bold>Basic Information:</Text>
        <Text>• Operating System: <Text color="green">{systemInfo.os}</Text> ({systemInfo.architecture})</Text>
        <Text>• Total RAM: <Text color="green">{systemInfo.totalRAM}GB</Text></Text>
        <Text>• Available RAM: <Text color="green">{systemInfo.availableRAM}GB</Text></Text>
        <Text>• RAM Tier: <Text color="yellow">Tier {ramTier}</Text> {tier ? `(${tier.name})` : ''}</Text>
      </Box>

      <Box flexDirection="column" marginY={1}>
        <Text bold>Ollama Status:</Text>
        <Text>• Status: {systemInfo.ollamaAvailable ? <Text color="green">✅ Running</Text> : <Text color="red">❌ Not detected</Text>}</Text>
        {systemInfo.ollamaVersion && (
          <Text>• Version: <Text color="green">v{systemInfo.ollamaVersion}</Text></Text>
        )}
      </Box>

      {systemInfo.gpus.length > 0 && (
        <Box flexDirection="column" marginY={1}>
          <Text bold>Graphics Cards:</Text>
          {systemInfo.gpus.map((gpu, index) => (
            <Text key={index}>
              • {gpu.vendor} {gpu.model} 
              {gpu.vram > 0 && <Text color="green"> ({gpu.vram}MB VRAM)</Text>}
            </Text>
          ))}
        </Box>
      )}

      <Box flexDirection="column" marginY={1}>
        <Text bold>Recommended Models:</Text>
        {recommendedModels.length > 0 ? (
          recommendedModels.map((model, index) => (
            <Text key={index}>
              • <Text color="blue">{model.name}</Text>
              {model.description && <Text color="gray"> - {model.description}</Text>}
            </Text>
          ))
        ) : (
          <Text color="red">• No recommended models for your RAM tier</Text>
        )}
      </Box>

      {verbose && tier && (
        <Box flexDirection="column" marginY={1}>
          <Text bold>All Models in Your Tier:</Text>
          {tier.models.map((model, index) => (
            <Text key={index}>
              • <Text color="cyan">{model.name}</Text> (Priority: {model.priority})
              {model.description && <Text color="gray"> - {model.description}</Text>}
            </Text>
          ))}
        </Box>
      )}

      {verbose && (
        <Box flexDirection="column" marginY={1}>
          <Text bold>All Available Tiers:</Text>
          {tierManager.getAllTiers().map((t, index) => (
            <Box key={index} flexDirection="column" marginLeft={2}>
              <Text color="yellow" bold>{t.name}:</Text>
              <Text>  RAM Range: {t.ramRange[0]}GB - {t.ramRange[1] === Infinity ? '∞' : t.ramRange[1] + 'GB'}</Text>
              <Text>  Models: {t.models.length}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};