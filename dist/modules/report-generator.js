import * as fs from 'fs/promises';
import * as path from 'path';
export class ReportGenerator {
    async generateReport(report, options) {
        let content;
        switch (options.format) {
            case 'json':
                content = this.generateJsonReport(report, options);
                break;
            case 'csv':
                content = this.generateCsvReport(report);
                break;
            case 'markdown':
                content = this.generateMarkdownReport(report, options);
                break;
            case 'html':
                content = this.generateHtmlReport(report, options);
                break;
            default:
                throw new Error(`Unsupported format: ${options.format}`);
        }
        if (options.outputPath) {
            await this.saveReport(content, options.outputPath);
        }
        return content;
    }
    async generateComparisonReport(comparison, options) {
        let content;
        switch (options.format) {
            case 'json':
                content = JSON.stringify(comparison, null, options.prettify ? 2 : 0);
                break;
            case 'markdown':
                content = this.generateComparisonMarkdown(comparison);
                break;
            case 'html':
                content = this.generateComparisonHtml(comparison);
                break;
            default:
                throw new Error(`Unsupported comparison format: ${options.format}`);
        }
        if (options.outputPath) {
            await this.saveReport(content, options.outputPath);
        }
        return content;
    }
    generateJsonReport(report, options) {
        const data = { ...report };
        if (!options.includeRawData) {
            // Remove raw metrics to reduce file size
            data.results.forEach(result => {
                delete result.rawMetrics;
            });
        }
        if (!options.includeSystemInfo) {
            delete data.systemInfo;
        }
        return JSON.stringify(data, null, options.prettify ? 2 : 0);
    }
    generateCsvReport(report) {
        const headers = [
            'Model',
            'Tokens/sec',
            'First Token Latency (ms)',
            'Total Latency (ms)',
            'Peak Memory (MB)',
            'Avg Memory (MB)',
            'Memory Efficiency',
            'Response Length',
            'Consistency (%)',
            'Completion Rate (%)',
            'Timestamp'
        ];
        const rows = report.results.map(result => [
            result.model,
            result.tokensPerSecond.toFixed(2),
            result.firstTokenLatency.toFixed(2),
            result.totalLatency.toFixed(2),
            result.memoryUsage.peakMemoryUsage.toFixed(2),
            result.memoryUsage.averageMemoryUsage.toFixed(2),
            result.memoryUsage.memoryEfficiency.toFixed(2),
            result.quality.averageResponseLength.toFixed(2),
            result.quality.consistency.toFixed(2),
            result.quality.completionRate.toFixed(2),
            result.timestamp.toISOString()
        ]);
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\\n');
    }
    generateMarkdownReport(report, options) {
        const lines = [];
        // Header
        lines.push('# Ollama Benchmark Report');
        lines.push('');
        lines.push(`**Generated:** ${report.summary.timestamp.toISOString()}`);
        lines.push(`**Duration:** ${(report.metadata.duration / 1000).toFixed(1)} seconds`);
        lines.push(`**Version:** ${report.metadata.version}`);
        lines.push('');
        // Summary
        lines.push('## Summary');
        lines.push('');
        lines.push(`- **Models Tested:** ${report.summary.totalModels}`);
        lines.push(`- **Total Benchmarks:** ${report.summary.totalBenchmarks}`);
        lines.push(`- **Fastest Model:** ${report.summary.fastestModel}`);
        lines.push(`- **Slowest Model:** ${report.summary.slowestModel}`);
        lines.push(`- **Average Speed:** ${report.summary.averageTokensPerSecond.toFixed(1)} tokens/sec`);
        lines.push('');
        // System Info
        if (options.includeSystemInfo !== false) {
            lines.push('## System Information');
            lines.push('');
            lines.push(`- **OS:** ${report.systemInfo.os} (${report.systemInfo.architecture})`);
            lines.push(`- **RAM:** ${report.systemInfo.totalRAM}GB total, ${report.systemInfo.availableRAM}GB available`);
            lines.push(`- **Ollama:** ${report.systemInfo.ollamaVersion || 'Not detected'}`);
            if (report.systemInfo.gpus.length > 0) {
                lines.push('- **GPUs:**');
                report.systemInfo.gpus.forEach(gpu => {
                    lines.push(`  - ${gpu.vendor} ${gpu.model} (${gpu.vram}MB VRAM)`);
                });
            }
            lines.push('');
        }
        // Results Table
        lines.push('## Benchmark Results');
        lines.push('');
        lines.push('| Model | Tokens/sec | First Token (ms) | Total Time (ms) | Memory (MB) | Quality Score |');
        lines.push('|-------|------------|------------------|-----------------|-------------|---------------|');
        report.results.forEach(result => {
            const qualityScore = (result.quality.consistency * result.quality.completionRate / 100).toFixed(1);
            lines.push(`| ${result.model} | ${result.tokensPerSecond.toFixed(1)} | ${result.firstTokenLatency.toFixed(0)} | ${result.totalLatency.toFixed(0)} | ${result.memoryUsage.averageMemoryUsage.toFixed(1)} | ${qualityScore} |`);
        });
        lines.push('');
        // Detailed Results
        lines.push('## Detailed Analysis');
        lines.push('');
        report.results.forEach(result => {
            lines.push(`### ${result.model}`);
            lines.push('');
            lines.push('**Performance Metrics:**');
            lines.push(`- Tokens per second: ${result.tokensPerSecond.toFixed(2)}`);
            lines.push(`- First token latency: ${result.firstTokenLatency.toFixed(2)}ms`);
            lines.push(`- Total latency: ${result.totalLatency.toFixed(2)}ms`);
            lines.push('');
            lines.push('**Memory Usage:**');
            lines.push(`- Peak memory: ${result.memoryUsage.peakMemoryUsage.toFixed(2)}MB`);
            lines.push(`- Average memory: ${result.memoryUsage.averageMemoryUsage.toFixed(2)}MB`);
            lines.push(`- Memory efficiency: ${result.memoryUsage.memoryEfficiency.toFixed(2)} tokens/MB`);
            lines.push('');
            lines.push('**Quality Metrics:**');
            lines.push(`- Average response length: ${result.quality.averageResponseLength.toFixed(1)} tokens`);
            lines.push(`- Response time: ${result.quality.responseTime.toFixed(1)}ms`);
            lines.push(`- Consistency: ${result.quality.consistency.toFixed(1)}%`);
            lines.push(`- Completion rate: ${result.quality.completionRate.toFixed(1)}%`);
            lines.push('');
        });
        return lines.join('\\n');
    }
    generateHtmlReport(report, options) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ollama Benchmark Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
        }
        .summary-card h3 {
            margin-top: 0;
            color: #007bff;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .model-details {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        .metric-group {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
        }
        .metric-group h4 {
            margin-top: 0;
            color: #495057;
        }
        .performance-bar {
            width: 100%;
            height: 20px;
            background-color: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 5px 0;
        }
        .performance-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Ollama Benchmark Report</h1>
        <p><strong>Generated:</strong> ${report.summary.timestamp.toISOString()}</p>
        <p><strong>Duration:</strong> ${(report.metadata.duration / 1000).toFixed(1)} seconds</p>
    </div>

    <div class="summary-grid">
        <div class="summary-card">
            <h3>Models Tested</h3>
            <p style="font-size: 2em; margin: 0; font-weight: bold;">${report.summary.totalModels}</p>
        </div>
        <div class="summary-card">
            <h3>Total Benchmarks</h3>
            <p style="font-size: 2em; margin: 0; font-weight: bold;">${report.summary.totalBenchmarks}</p>
        </div>
        <div class="summary-card">
            <h3>Fastest Model</h3>
            <p style="font-size: 1.2em; margin: 0; font-weight: bold;">${report.summary.fastestModel}</p>
        </div>
        <div class="summary-card">
            <h3>Average Speed</h3>
            <p style="font-size: 1.5em; margin: 0; font-weight: bold;">${report.summary.averageTokensPerSecond.toFixed(1)} tok/s</p>
        </div>
    </div>

    ${options.includeSystemInfo !== false ? `
    <div class="model-details">
        <h2>🖥️ System Information</h2>
        <div class="metrics-grid">
            <div class="metric-group">
                <h4>Hardware</h4>
                <p><strong>OS:</strong> ${report.systemInfo.os} (${report.systemInfo.architecture})</p>
                <p><strong>RAM:</strong> ${report.systemInfo.totalRAM}GB total, ${report.systemInfo.availableRAM}GB available</p>
                <p><strong>Ollama:</strong> ${report.systemInfo.ollamaVersion || 'Not detected'}</p>
            </div>
            ${report.systemInfo.gpus.length > 0 ? `
            <div class="metric-group">
                <h4>Graphics</h4>
                ${report.systemInfo.gpus.map(gpu => `
                    <p><strong>${gpu.vendor}:</strong> ${gpu.model} (${gpu.vram}MB VRAM)</p>
                `).join('')}
            </div>
            ` : ''}
        </div>
    </div>
    ` : ''}

    <h2>📊 Results Overview</h2>
    <table>
        <thead>
            <tr>
                <th>Model</th>
                <th>Tokens/sec</th>
                <th>First Token (ms)</th>
                <th>Total Time (ms)</th>
                <th>Memory (MB)</th>
                <th>Quality Score</th>
            </tr>
        </thead>
        <tbody>
            ${report.results.map(result => {
            const qualityScore = (result.quality.consistency * result.quality.completionRate / 100).toFixed(1);
            return `
                <tr>
                    <td><strong>${result.model}</strong></td>
                    <td>${result.tokensPerSecond.toFixed(1)}</td>
                    <td>${result.firstTokenLatency.toFixed(0)}</td>
                    <td>${result.totalLatency.toFixed(0)}</td>
                    <td>${result.memoryUsage.averageMemoryUsage.toFixed(1)}</td>
                    <td>${qualityScore}</td>
                </tr>
              `;
        }).join('')}
        </tbody>
    </table>

    <h2>📈 Detailed Analysis</h2>
    ${report.results.map(result => {
            const maxTokensPerSec = Math.max(...report.results.map(r => r.tokensPerSecond));
            const performancePercentage = (result.tokensPerSecond / maxTokensPerSec) * 100;
            return `
        <div class="model-details">
            <h3>${result.model}</h3>
            <div class="performance-bar">
                <div class="performance-fill" style="width: ${performancePercentage}%"></div>
            </div>
            <p style="text-align: center; margin: 5px 0; font-weight: bold;">${result.tokensPerSecond.toFixed(1)} tokens/sec</p>
            
            <div class="metrics-grid">
                <div class="metric-group">
                    <h4>⚡ Performance</h4>
                    <p><strong>Tokens/sec:</strong> ${result.tokensPerSecond.toFixed(2)}</p>
                    <p><strong>First token:</strong> ${result.firstTokenLatency.toFixed(2)}ms</p>
                    <p><strong>Total time:</strong> ${result.totalLatency.toFixed(2)}ms</p>
                </div>
                <div class="metric-group">
                    <h4>💾 Memory</h4>
                    <p><strong>Peak:</strong> ${result.memoryUsage.peakMemoryUsage.toFixed(2)}MB</p>
                    <p><strong>Average:</strong> ${result.memoryUsage.averageMemoryUsage.toFixed(2)}MB</p>
                    <p><strong>Efficiency:</strong> ${result.memoryUsage.memoryEfficiency.toFixed(2)} tok/MB</p>
                </div>
                <div class="metric-group">
                    <h4>🎯 Quality</h4>
                    <p><strong>Response length:</strong> ${result.quality.averageResponseLength.toFixed(1)} tokens</p>
                    <p><strong>Consistency:</strong> ${result.quality.consistency.toFixed(1)}%</p>
                    <p><strong>Completion rate:</strong> ${result.quality.completionRate.toFixed(1)}%</p>
                </div>
            </div>
        </div>
      `;
        }).join('')}

    <footer style="text-align: center; margin-top: 50px; padding: 20px; color: #6c757d;">
        <p>Generated by <strong>Ollama Benchmark Node.js</strong> v${report.metadata.version}</p>
    </footer>
</body>
</html>`;
        return html;
    }
    generateComparisonMarkdown(comparison) {
        const lines = [];
        lines.push('# Benchmark Comparison Report');
        lines.push('');
        lines.push(`**Baseline:** ${comparison.baseline.timestamp.toISOString().split('T')[0]} (${comparison.baseline.totalModels} models)`);
        lines.push(`**Current:** ${comparison.current.timestamp.toISOString().split('T')[0]} (${comparison.current.totalModels} models)`);
        lines.push('');
        lines.push('## Summary');
        lines.push('');
        lines.push(`- **Models Compared:** ${comparison.summary.modelsCompared}`);
        lines.push(`- **Average Speed Improvement:** ${comparison.summary.averageSpeedImprovement.toFixed(1)}%`);
        lines.push(`- **Average Latency Improvement:** ${comparison.summary.averageLatencyImprovement.toFixed(1)}%`);
        lines.push('');
        lines.push('## Model Comparisons');
        lines.push('');
        lines.push('| Model | Tokens/sec Change | Latency Change | Memory Change |');
        lines.push('|-------|-------------------|----------------|---------------|');
        comparison.comparisons.forEach(comp => {
            const speedChange = comp.tokensPerSecond.change >= 0 ? `+${comp.tokensPerSecond.change.toFixed(1)}%` : `${comp.tokensPerSecond.change.toFixed(1)}%`;
            const latencyChange = comp.firstTokenLatency.change >= 0 ? `+${comp.firstTokenLatency.change.toFixed(1)}%` : `${comp.firstTokenLatency.change.toFixed(1)}%`;
            const memoryChange = comp.memoryUsage.change >= 0 ? `+${comp.memoryUsage.change.toFixed(1)}%` : `${comp.memoryUsage.change.toFixed(1)}%`;
            lines.push(`| ${comp.model} | ${speedChange} | ${latencyChange} | ${memoryChange} |`);
        });
        return lines.join('\\n');
    }
    generateComparisonHtml(comparison) {
        // Similar HTML structure for comparison reports
        return `<html><body><h1>Comparison Report</h1><p>HTML comparison report coming soon...</p></body></html>`;
    }
    async saveReport(content, outputPath) {
        const dir = path.dirname(outputPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(outputPath, content, 'utf-8');
    }
    // Generate filename based on format and timestamp
    static generateFilename(format, prefix = 'benchmark-report') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        return `${prefix}-${timestamp}.${format}`;
    }
    // Get MIME type for format
    static getMimeType(format) {
        const mimeTypes = {
            json: 'application/json',
            csv: 'text/csv',
            markdown: 'text/markdown',
            html: 'text/html',
        };
        return mimeTypes[format] || 'text/plain';
    }
}
//# sourceMappingURL=report-generator.js.map