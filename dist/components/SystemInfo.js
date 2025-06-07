import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { SystemDetector } from '../modules/system-detection.js';
import { ModelTierManager } from '../modules/model-tiers.js';
export const SystemInfo = ({ verbose }) => {
    const [loading, setLoading] = useState(true);
    const [systemInfo, setSystemInfo] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        detectSystem();
    }, []);
    const detectSystem = async () => {
        try {
            const detector = new SystemDetector();
            const info = await detector.detectSystem();
            setSystemInfo(info);
            setLoading(false);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setLoading(false);
        }
    };
    if (loading) {
        return (React.createElement(Box, null,
            React.createElement(Spinner, { type: "dots" }),
            React.createElement(Text, null, " Detecting system information...")));
    }
    if (error) {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "red", bold: true }, "\u274C System Detection Failed"),
            React.createElement(Text, { color: "red" }, error)));
    }
    if (!systemInfo) {
        return (React.createElement(Box, null,
            React.createElement(Text, { color: "red" }, "Failed to detect system information")));
    }
    const detector = new SystemDetector();
    const tierManager = new ModelTierManager();
    const ramTier = detector.getRAMTier(systemInfo.totalRAM);
    const tier = tierManager.getAllTiers().find(t => t.priority === ramTier);
    const recommendedModels = tierManager.getRecommendedModels(systemInfo.totalRAM);
    return (React.createElement(Box, { flexDirection: "column", padding: 1 },
        React.createElement(Text, { bold: true, color: "blue", underline: true }, "\uD83D\uDDA5\uFE0F  System Information"),
        React.createElement(Box, { flexDirection: "column", marginY: 1 },
            React.createElement(Text, { bold: true }, "Basic Information:"),
            React.createElement(Text, null,
                "\u2022 Operating System: ",
                React.createElement(Text, { color: "green" }, systemInfo.os),
                " (",
                systemInfo.architecture,
                ")"),
            React.createElement(Text, null,
                "\u2022 Total RAM: ",
                React.createElement(Text, { color: "green" },
                    systemInfo.totalRAM,
                    "GB")),
            React.createElement(Text, null,
                "\u2022 Available RAM: ",
                React.createElement(Text, { color: "green" },
                    systemInfo.availableRAM,
                    "GB")),
            React.createElement(Text, null,
                "\u2022 RAM Tier: ",
                React.createElement(Text, { color: "yellow" },
                    "Tier ",
                    ramTier),
                " ",
                tier ? `(${tier.name})` : '')),
        React.createElement(Box, { flexDirection: "column", marginY: 1 },
            React.createElement(Text, { bold: true }, "Ollama Status:"),
            React.createElement(Text, null,
                "\u2022 Status: ",
                systemInfo.ollamaAvailable ? React.createElement(Text, { color: "green" }, "\u2705 Running") : React.createElement(Text, { color: "red" }, "\u274C Not detected")),
            systemInfo.ollamaVersion && (React.createElement(Text, null,
                "\u2022 Version: ",
                React.createElement(Text, { color: "green" },
                    "v",
                    systemInfo.ollamaVersion)))),
        systemInfo.gpus.length > 0 && (React.createElement(Box, { flexDirection: "column", marginY: 1 },
            React.createElement(Text, { bold: true }, "Graphics Cards:"),
            systemInfo.gpus.map((gpu, index) => (React.createElement(Text, { key: index },
                "\u2022 ",
                gpu.vendor,
                " ",
                gpu.model,
                gpu.vram > 0 && React.createElement(Text, { color: "green" },
                    " (",
                    gpu.vram,
                    "MB VRAM)")))))),
        React.createElement(Box, { flexDirection: "column", marginY: 1 },
            React.createElement(Text, { bold: true }, "Recommended Models:"),
            recommendedModels.length > 0 ? (recommendedModels.map((model, index) => (React.createElement(Text, { key: index },
                "\u2022 ",
                React.createElement(Text, { color: "blue" }, model.name),
                model.description && React.createElement(Text, { color: "gray" },
                    " - ",
                    model.description))))) : (React.createElement(Text, { color: "red" }, "\u2022 No recommended models for your RAM tier"))),
        verbose && tier && (React.createElement(Box, { flexDirection: "column", marginY: 1 },
            React.createElement(Text, { bold: true }, "All Models in Your Tier:"),
            tier.models.map((model, index) => (React.createElement(Text, { key: index },
                "\u2022 ",
                React.createElement(Text, { color: "cyan" }, model.name),
                " (Priority: ",
                model.priority,
                ")",
                model.description && React.createElement(Text, { color: "gray" },
                    " - ",
                    model.description)))))),
        verbose && (React.createElement(Box, { flexDirection: "column", marginY: 1 },
            React.createElement(Text, { bold: true }, "All Available Tiers:"),
            tierManager.getAllTiers().map((t, index) => (React.createElement(Box, { key: index, flexDirection: "column", marginLeft: 2 },
                React.createElement(Text, { color: "yellow", bold: true },
                    t.name,
                    ":"),
                React.createElement(Text, null,
                    "  RAM Range: ",
                    t.ramRange[0],
                    "GB - ",
                    t.ramRange[1] === Infinity ? '∞' : t.ramRange[1] + 'GB'),
                React.createElement(Text, null,
                    "  Models: ",
                    t.models.length))))))));
};
//# sourceMappingURL=SystemInfo.js.map