import { BenchmarkReport, ComparisonReport } from './results-processor.js';
export type OutputFormat = 'json' | 'csv' | 'markdown' | 'html';
export interface ReportOptions {
    format: OutputFormat;
    outputPath?: string;
    includeRawData?: boolean;
    includeSystemInfo?: boolean;
    prettify?: boolean;
}
export declare class ReportGenerator {
    generateReport(report: BenchmarkReport, options: ReportOptions): Promise<string>;
    generateComparisonReport(comparison: ComparisonReport, options: ReportOptions): Promise<string>;
    private generateJsonReport;
    private generateCsvReport;
    private generateMarkdownReport;
    private generateHtmlReport;
    private generateComparisonMarkdown;
    private generateComparisonHtml;
    private saveReport;
    static generateFilename(format: OutputFormat, prefix?: string): string;
    static getMimeType(format: OutputFormat): string;
}
//# sourceMappingURL=report-generator.d.ts.map