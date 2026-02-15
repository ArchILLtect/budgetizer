// Phase 5: Streaming CSV parser using PapaParse with chunk callbacks.
// This utility wraps Papa.parse to emit normalized row objects progressively.
// It does not classify/dedupe; it simply parses and pushes raw rows.
// Downstream code can accumulate or feed rows into analyzeImport via the `parsedRows` option.

import Papa from 'papaparse';

/**
 * streamParseCsv
 * @param {File|String} fileOrText - File object (browser) or raw CSV string
 * @param {Object} opts
 *  - onRow(row, index) -> void | boolean (return false to stop)
 *  - onProgress({ rows, bytes, finished }) progressive callback
 *  - onComplete({ rows, meta }) final callback (rows truncated if stop early)
 *  - header: boolean (default true) treat first row as header
 *  - preview: number optional preview limit
 */

type StreamParseOpts = {
    onRow?: (row: any, index: number) => void | boolean;
    onChunk?: (
        rows: any[],
        startIndex: number,
        meta: { bytes: number | null }
    ) => void | boolean | Promise<void | boolean>;
    onProgress?: (progress: { rows: number; bytes: number | null; finished: boolean }) => void;
    onComplete?: (result: { rows: any[]; meta: { rowCount: number; aborted: boolean; parseErrors: any[] }; error?: any }) => void;
    header?: boolean;
    preview?: number;
    chunkSize?: number;
    worker?: boolean | 'auto';
    collectRows?: boolean;
};

export function streamParseCsv(fileOrText: File | string, opts: StreamParseOpts = {}) {
    const {
        onRow = () => {},
        onChunk,
        onProgress = () => {},
        onComplete = () => {},
        header = true,
        preview,
        chunkSize = 1024 * 64, // 64KB
        worker = 'auto',
        collectRows = true,
    } = opts;

    let rowCount = 0; // counts data rows (excluding header)
    let stopped = false;
    const collected: any[] = [];
    const parseErrors: any[] = [];

    let parserRef: any = null;
    const controller = {
        abort: () => {
            stopped = true;
            if (parserRef && parserRef.abort) {
                try {
                    parserRef.abort();
                } catch {
                    /* ignore */
                }
            }
        },
    };

    const resolvedWorker =
        worker === 'auto'
            ? fileOrText instanceof File
                ? (fileOrText.size || 0) > 500_000
                : false
            : worker;

    Papa.parse(fileOrText as any, {
        header,
        preview,
        skipEmptyLines: true,
        worker: resolvedWorker,
        chunkSize,
        chunk: (results: Papa.ParseResult<any>, parser: any) => {
            if (!parserRef) parserRef = parser;
            if (stopped) {
                parser.abort();
                return;
            }

            const bytes: number | null =
                typeof (results as any)?.meta?.cursor === 'number' ? (results as any).meta.cursor : null;

            const rows = Array.isArray(results.data) ? results.data : [];
            const startIndex = rowCount;

            for (const row of results.data) {
                // Assign 1-based file line number: header assumed at line 1 when header=true
                if (header) {
                    row.__line = rowCount + 2; // +2 => header line (1) + current data index +1
                } else {
                    row.__line = rowCount + 1;
                }
                const cont = onRow(row, rowCount);
                if (collectRows) collected.push(row);
                rowCount++;
                if (cont === false) {
                    stopped = true;
                    parser.abort();
                    break;
                }
            }

            if (onChunk) {
                try {
                    parser.pause?.();
                } catch {
                    /* ignore */
                }

                Promise.resolve(onChunk(rows, startIndex, { bytes }))
                    .then((cont) => {
                        if (cont === false) {
                            stopped = true;
                            parser.abort();
                            return;
                        }
                        try {
                            parser.resume?.();
                        } catch {
                            /* ignore */
                        }
                    })
                    .catch(() => {
                        try {
                            parser.resume?.();
                        } catch {
                            /* ignore */
                        }
                    });
            }

            onProgress({ rows: rowCount, bytes, finished: false });
        },
        complete: (results: Papa.ParseResult<any>) => {
            if (results && results.errors && results.errors.length) {
                for (const err of results.errors) {
                    parseErrors.push({ line: (err.row ?? -1) + 1, message: err.message });
                }
            }
            const bytes: number | null =
                typeof (results as any)?.meta?.cursor === 'number' ? (results as any).meta.cursor : null;
            onProgress({ rows: rowCount, bytes, finished: true });
            onComplete({
                rows: collected,
                meta: { rowCount, aborted: stopped, parseErrors },
            });
        },
        error: (err: any) => {
            parseErrors.push({
                line: null,
                message: err?.message || 'Streaming parse error',
            });
            onComplete({
                error: err,
                rows: collected,
                meta: { rowCount, aborted: stopped, parseErrors },
            });
        },
    });
    return controller;
}
