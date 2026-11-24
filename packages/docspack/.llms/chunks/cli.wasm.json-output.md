# bpmnkit worker wasm — JSON output

`--format json` prints the build report that `check`, `build` and `test` produce:

```json
{
  "ok": false,
  "diagnostics": [
    { "file": "src/lib.rs", "line": 7, "col": 9, "code": "E0308", "message": "mismatched types", "suggestion": "…" }
  ],
  "tests": [{ "name": "greets", "passed": true, "duration_ms": 4 }],
  "timings": [{ "stage": "check", "ms": 360 }],
  "artifact": { "component_digest": "…", "source_digest": "…", "manifest": {}, "contract_version": "…", "sdk_version": "…", "toolchain": "rustc …", "lock_digest": "…" }
}
```

`suggestion` and `tests[].message` appear only when set; `artifact` only after a successful package
stage. The text format prints one `file:line:col: code: message` line per diagnostic (with an
indented `hint:`), one `ok` / `FAIL` line per sample, and a final `ok|failed — stage N ms, …` line.
`build` also writes the same artifact data to `metadata.json`.

---
Source: https://bpmnkit.com/docs/cli/wasm
