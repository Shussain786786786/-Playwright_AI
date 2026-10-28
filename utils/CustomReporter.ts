import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FullResult, Reporter, TestCase, TestResult } from "@playwright/test/reporter";

type CustomReporterOptions = {
    outputDir?: string;
};

type TestSummary = {
    title: string;
    file: string;
    line: number;
    project: string;
    status: string;
    durationMs: number;
    retries: number;
    error?: string;
};

export default class CustomReporter implements Reporter {
    private readonly outputDir: string;
    private readonly tests: TestSummary[] = [];

    constructor(options: CustomReporterOptions = {}) {
        this.outputDir = path.resolve(options.outputDir ?? "custom-report");
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        const error = result.errors
            .map((entry) => entry.message ?? entry.stack)
            .filter((message): message is string => Boolean(message))
            .join("\n");

        this.tests.push({
            title: test.title,
            file: path.relative(process.cwd(), test.location.file),
            line: test.location.line,
            project: test.parent.project()?.name ?? "",
            status: result.status,
            durationMs: result.duration,
            retries: result.retry,
            ...(error ? { error } : {}),
        });
    }

    async onEnd(result: FullResult): Promise<void> {
        const summary = {
            status: result.status,
            durationMs: result.duration,
            generatedAt: new Date().toISOString(),
            total: this.tests.length,
            passed: this.tests.filter((test) => test.status === "passed").length,
            failed: this.tests.filter((test) => test.status === "failed" || test.status === "timedOut").length,
            skipped: this.tests.filter((test) => test.status === "skipped").length,
            tests: this.tests,
        };

        await mkdir(this.outputDir, { recursive: true });
        await Promise.all([
            writeFile(path.join(this.outputDir, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8"),
            writeFile(path.join(this.outputDir, "index.html"), this.createHtml(summary), "utf8"),
        ]);

        console.log(`Custom report written to ${this.outputDir}`);
    }

    printsToStdio(): boolean {
        return false;
    }

    private createHtml(summary: {
        status: string;
        durationMs: number;
        generatedAt: string;
        total: number;
        passed: number;
        failed: number;
        skipped: number;
        tests: TestSummary[];
    }): string {
        const rows = summary.tests.map((test) => `
            <tr>
                <td>${this.escapeHtml(test.title)}</td>
                <td>${this.escapeHtml(test.project)}</td>
                <td><span class="status ${this.escapeHtml(test.status)}">${this.escapeHtml(test.status)}</span></td>
                <td>${test.durationMs} ms</td>
                <td>${this.escapeHtml(test.file)}:${test.line}</td>
                <td>${this.escapeHtml(test.error ?? "")}</td>
            </tr>`).join("");

        return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Playwright Custom Test Report</title>
    <style>
        body{font:15px/1.5 system-ui,sans-serif;margin:2rem;color:#202124}
        h1{margin-bottom:.25rem}.meta{color:#5f6368;margin-top:0}
        .summary{display:flex;gap:1rem;flex-wrap:wrap;margin:1.5rem 0}
        .card{padding:1rem 1.5rem;border:1px solid #dadce0;border-radius:8px;min-width:100px}
        .card strong{display:block;font-size:1.5rem}
        table{border-collapse:collapse;width:100%}th,td{border-bottom:1px solid #dadce0;padding:.7rem;text-align:left;vertical-align:top}
        th{background:#f8f9fa}.status{font-weight:700;text-transform:capitalize}
        .passed{color:#137333}.failed,.timedOut{color:#c5221f}.skipped{color:#5f6368}
        td:last-child{white-space:pre-wrap;max-width:30rem}
    </style>
</head>
<body>
    <h1>Playwright Custom Test Report</h1>
    <p class="meta">Run status: <strong>${this.escapeHtml(summary.status)}</strong> · Generated ${this.escapeHtml(summary.generatedAt)} · Duration ${summary.durationMs} ms</p>
    <section class="summary">
        <div class="card">Total<strong>${summary.total}</strong></div>
        <div class="card">Passed<strong>${summary.passed}</strong></div>
        <div class="card">Failed<strong>${summary.failed}</strong></div>
        <div class="card">Skipped<strong>${summary.skipped}</strong></div>
    </section>
    <table>
        <thead><tr><th>Test</th><th>Project</th><th>Status</th><th>Duration</th><th>Location</th><th>Error</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6">No tests were executed.</td></tr>'}</tbody>
    </table>
</body>
</html>
`;
    }

    private escapeHtml(value: string): string {
        return value.replace(/[&<>"']/g, (character) => {
            const entities: Record<string, string> = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            };
            return entities[character];
        });
    }
}
