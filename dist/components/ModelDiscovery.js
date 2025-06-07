import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { ModelDiscovery as Discovery } from '../modules/model-discovery.js';
import { SystemDetector } from '../modules/system-detection.js';
export const ModelDiscovery = ({ options }) => {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState('');
    const [error, setError] = useState(null);
    const [systemInfo, setSystemInfo] = useState(null);
    useEffect(() => {
        handleDiscoveryCommand();
    }, []);
    const handleDiscoveryCommand = async () => {
        try {
            const discovery = new Discovery();
            const detector = new SystemDetector();
            const sysInfo = await detector.detectSystem();
            setSystemInfo(sysInfo);
            if (options.pull) {
                setResult(`📥 Pulling model: ${options.pull}...\nThis may take several minutes depending on the model size.`);
                await discovery.pullModel(options.pull);
                setResult(`✅ Successfully pulled: ${options.pull}`);
                setLoading(false);
                return;
            }
            if (options.size) {
                const models = options.size.split(',').map((m) => m.trim());
                const sizeInfo = discovery.calculateTotalDownloadSize(models);
                let output = '📊 Download Size Information:\n\n';
                if (sizeInfo.breakdown.length === 0) {
                    output += 'No size information available for these models.';
                }
                else {
                    sizeInfo.breakdown.forEach(item => {
                        output += `• ${item.name}: ${discovery.formatSizeInfo(item.downloadGB)}\n`;
                    });
                    if (sizeInfo.breakdown.length > 1) {
                        output += `\nTotal download: ${discovery.formatSizeInfo(sizeInfo.totalDownloadGB)}`;
                        output += `\nTotal disk space: ${discovery.formatSizeInfo(sizeInfo.totalDiskGB)}`;
                    }
                }
                setResult(output);
                setLoading(false);
                return;
            }
            if (options.search) {
                const results = discovery.searchModels(options.search);
                let output = `🔍 Search Results for "${options.search}":\n\n`;
                if (results.length === 0) {
                    output += 'No models found matching your search.';
                }
                else {
                    results.forEach(model => {
                        const ramInfo = model.minRAM <= sysInfo.totalRAM ? '✅ Compatible' : '❌ Needs more RAM';
                        const downloadSize = model.downloadSizeGB !== undefined ? ` | Download: ${discovery.formatSizeInfo(model.downloadSizeGB)}` : '';
                        output += `• ${model.name} - ${model.description}\n`;
                        output += `  Category: ${model.category} | RAM: ${model.minRAM}GB+${downloadSize} | ${ramInfo}\n\n`;
                    });
                }
                setResult(output);
                setLoading(false);
                return;
            }
            if (options.installed) {
                const installed = await discovery.getInstalledModels();
                let output = '📦 Installed Models:\n\n';
                if (installed.length === 0) {
                    output += 'No models installed. Use --pull <model> to install models.';
                }
                else {
                    installed.forEach(model => {
                        output += `• ${model.name} (${model.parameterSize})\n`;
                        output += `  Family: ${model.family} | Size: ${model.sizeGB.toFixed(1)}GB | Quantization: ${model.quantization}\n\n`;
                    });
                }
                setResult(output);
                setLoading(false);
                return;
            }
            if (options.trending) {
                const trending = discovery.getTrendingModels();
                let output = '🔥 Trending Models:\n\n';
                trending.forEach((model, index) => {
                    const ramInfo = model.minRAM <= sysInfo.totalRAM ? '✅' : '❌';
                    const downloadSize = model.downloadSizeGB !== undefined ? ` | Download: ${discovery.formatSizeInfo(model.downloadSizeGB)}` : '';
                    output += `${index + 1}. ${model.name} ${ramInfo}\n`;
                    output += `   ${model.description}\n`;
                    output += `   Category: ${model.category} | RAM: ${model.minRAM}GB+ | Popularity: ${model.popularity}%${downloadSize}\n\n`;
                });
                setResult(output);
                setLoading(false);
                return;
            }
            // Default: Show recommendations for user's RAM
            const recommendations = await discovery.getModelRecommendations(sysInfo.totalRAM);
            let output = `🔍 Model Discovery\n\n📊 Recommendations for ${sysInfo.totalRAM}GB RAM:\n\n`;
            if (recommendations.installed.length > 0) {
                output += '✅ Already Installed:\n';
                recommendations.installed.forEach(model => {
                    output += `• ${model.name} (${model.parameterSize}) - ${model.sizeGB.toFixed(1)}GB\n`;
                });
                output += '\n';
            }
            if (recommendations.canInstall.length > 0) {
                output += '💡 Recommended to Install:\n';
                recommendations.canInstall.forEach(model => {
                    const downloadSize = model.downloadSizeGB !== undefined ? ` | Download: ${discovery.formatSizeInfo(model.downloadSizeGB)}` : '';
                    output += `• ${model.name} - ${model.description}\n`;
                    output += `  Category: ${model.category} | RAM: ${model.minRAM}GB+ | Popularity: ${model.popularity}%${downloadSize}\n`;
                    output += `  Pull: ollama pull ${model.name}\n\n`;
                });
            }
            // Show by category
            if (options.category) {
                const categoryModels = discovery.getPopularModels(options.category);
                output += `\n🏷️  ${options.category.charAt(0).toUpperCase() + options.category.slice(1)} Models:\n`;
                categoryModels.forEach(model => {
                    const ramInfo = model.minRAM <= sysInfo.totalRAM ? '✅' : '❌';
                    const downloadSize = model.downloadSizeGB !== undefined ? ` | Download: ${discovery.formatSizeInfo(model.downloadSizeGB)}` : '';
                    output += `• ${model.name} ${ramInfo} - ${model.description}\n`;
                    output += `  RAM: ${model.minRAM}GB+ | Popularity: ${model.popularity}%${downloadSize}\n\n`;
                });
            }
            else {
                output += '\n🏷️  Browse by Category:\n';
                output += '• chat - General conversation models\n';
                output += '• code - Programming and code generation\n';
                output += '• reasoning - Advanced reasoning and math\n';
                output += '• vision - Image understanding models\n\n';
                output += 'Use --category <type> to see models in each category\n';
            }
            output += '\nCommands:\n';
            output += '• --search <query>    Search for models\n';
            output += '• --category <type>   Filter by category\n';
            output += '• --trending          Show popular models\n';
            output += '• --installed         Show installed models\n';
            output += '• --pull <model>      Install a model\n';
            output += '• --size <models>     Show download sizes';
            setResult(output);
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
            React.createElement(Text, null,
                " ",
                options.pull ? 'Pulling model...' : 'Discovering models...')));
    }
    if (error) {
        return (React.createElement(Box, { flexDirection: "column", padding: 1 },
            React.createElement(Text, { color: "red", bold: true }, "\u274C Discovery Failed"),
            React.createElement(Text, { color: "red" }, error)));
    }
    return (React.createElement(Box, { flexDirection: "column", padding: 1 }, result.split('\n').map((line, index) => (React.createElement(Text, { key: index }, line)))));
};
//# sourceMappingURL=ModelDiscovery.js.map