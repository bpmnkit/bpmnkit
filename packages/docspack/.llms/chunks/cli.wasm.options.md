# bpmnkit worker wasm — Options

| Option | Applies to | Meaning |
|--------|-----------|---------|
| `--format text\|json` | all but `run` | Output format. Default `text`. |
| `--dir D` | `init` | Target directory instead of `./<name>`. |
| `--out D` | `build` | Output directory instead of `DIR/dist`. |
| `--sdk PATH` | `check`, `build`, `test` | Path to the `bpmnkit-wasm-sdk` crate. Env `BPMNKIT_WASM_SDK`; inside the repo it is found automatically. |
| `--target-dir PATH` | `check`, `build`, `test` | Shared cargo target directory. Env `BPMNKIT_WASM_TARGET_DIR`; default `$XDG_CACHE_HOME/bpmnkit-wasm/target` (else `~/.cache/…`). |

Unknown options and unknown commands print the usage and fail.

---
Source: https://bpmnkit.com/docs/cli/wasm
