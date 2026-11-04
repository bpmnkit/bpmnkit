# Proposal: Rust core for BPMN Kit

Status: analysis only, 2026-11-04. Nothing implemented. Figures are from line and test counts, not benchmarks.

## TL;DR

- **Do not rewrite the whole library.** About half the code (canvas, editor, plugins, studio, drop, vscode, operate) is tied to the DOM or the editor. Rust gains nothing there, and WASM calls would add overhead.
- **Do build one shared Rust core** for the pure, batch-shaped logic: FEEL, BPMN/DMN/Form parse and serialize, lint, migrate, compact/process-text, layout, and the text renderers. Keep the published `@bpmnkit/*` TS API as a thin facade over it.
- **Node: yes.** Ship one WASM package that runs in browsers, Node, Deno, Bun, edge workers, VS Code and Tauri. Add napi-rs native addons only if a heavy server workload needs them. Rust tools (CLI, Tauri, reebe, Python) link the crates directly, with no WASM.
- **Gate first.** Before any port, build the existing `reebe-wasm` with a size profile and benchmark FEEL and BPMN parsing against TS. Go only if the module is under about 1.5 MB gzipped and no slower on realistic diagrams.
- **Cost.** Core is about 40–50 person-weeks. The useful non-core parts are about 30–50 person-weeks. Only the CLI and full proxy parity push toward the high end, and both can wait.

## 1. Starting point

| Area | TS today | Rust today |
|---|---|---|
| core | ~43k LOC logic plus a 96k-line generated template file; 1,697 tests | `reebe-bpmn` is a read-only parser (4.7k LOC, 61 tests). `reebe-dmn` parses and evaluates (0.9k LOC, 8 tests). |
| feel | 5.0k LOC; 263 tests including the TCK and a Camunda parity suite | `reebe-feel` (3.4k LOC, 91 tests). No TCK run found. |
| engine | 7k LOC simulator, 204 tests | `reebe-engine` (16k LOC, 219 tests). Reebe is already the source of truth for Zeebe semantics. |
| bindings | — | `reebe-wasm` uses wasm-bindgen and serde-wasm-bindgen, built with `wasm-pack --target web`. Node loads it through `initSync`. Every return is typed `any`. There is no size profile. |
| proxy | 9.8k LOC, 149 tests | `proxy-rs`: 2.1k LOC. About 70% of the TS proxy is still missing. |
| cli | `casen`, 17k LOC, 218 tests, TS plugin hooks | none |

**Duplication exists today.** FEEL is implemented twice, and BPMN and DMN parsing are implemented twice. The TS side parses for editing and lossless round-trip. Rust parses for execution. The models differ and nothing in CI runs the same fixtures against both. FEEL drift risk is high (dates and durations, number precision, null propagation, builtins). A shared core removes this problem, which is the strongest argument for the work.

## 2. What moves and what stays

| Class | Packages | Why |
|---|---|---|
| **Move to Rust** | core logic (xml, bpmn model/parser/serializer, zeebe/camunda-compat, c7 migrate + JUEL, process-text/compact, lint/optimize, layout, dmn, form, stable-ids/semantic-hash), feel (lexer, parser, evaluator, builtins), patterns, ascii, markdown, flow | Pure and deterministic. Useful in CLI, server, browser and other languages. |
| **Move as data** | connector templates (96k-line `generated.ts`), connectors catalog, profiles, api (generate from OpenAPI per language) | Data and generated code, not logic. Ship JSON and emit a client per target. |
| **Wrap (TS facade over Rust)** | `@bpmnkit/core` public API, the fluent builder, engine (re-base on reebe-wasm, then drop `instance.ts`), user-tasks, FEEL formatter/highlighter (TS over a Rust token stream) | Keeps the TS API and typing that users and plugins rely on. |
| **Stay TS** | canvas, editor, ui, plugins, operate, studio, drop, vscode, landing/learn, connector-gen, cli-sdk, worker-client, docspack, `core/node` (fs) | Bound to DOM, Preact, Astro, npm or I/O. Rust gives no gain. |

**Boundary rule.** Port batch operations (parse, serialize, lint, layout, migrate, evaluate). Keep fine-grained model edits in JS. One editor drag can cause many model mutations, and sending each one through WASM can be slower than the current code.

## 3. Target layout

```
crates/                       (new cargo workspace, MIT; reebe consumes it)
  bpmnkit-xml        span-preserving reader/writer (xml-patch equivalent)
  bpmnkit-bpmn       model, parser, serializer, ops
  bpmnkit-zeebe      extensions, camunda-compat rules/data
  bpmnkit-c7         migrate + JUEL
  bpmnkit-feel       single FEEL; reebe-feel re-exports it
  bpmnkit-dmn        model/parser/serializer/eval
  bpmnkit-form
  bpmnkit-lint       bpmnlint rules + optimize
  bpmnkit-layout
  bpmnkit-text       process-text, compact, ascii, markdown, flow
  bpmnkit-templates  connector templates as JSON (include_str!)
  bpmnkit-wasm       the only wasm crate (wasm-bindgen + tsify); also hosts reebe engine bindings
  bpmnkit-cli        native binary (clap), later
packages/core-wasm  = @bpmnkit/core-wasm   generated: .wasm + .d.ts
packages/core       = @bpmnkit/core        TS facade, same public API, TS fallback during migration
```

- `reebe-bpmn`, `reebe-dmn` and `reebe-feel` become consumers of these crates, with an execution view behind a feature flag. That gives one model for each schema.
- `apps/reebe-wasm` merges into `bpmnkit-wasm`, so there is one artifact and one init path.

## 4. Bindings

| Target | Choice | Notes |
|---|---|---|
| Browser | WASM, `wasm-pack --target web`, lazy loaded | Release profile `opt-level="z"`, `lto`, `codegen-units=1`, `panic="abort"`, then `wasm-opt -Oz`. Set a size budget in CI. |
| **Node** | **The same WASM package** | Add an `exports` condition for `node` that loads with `initSync(readFileSync(...))`, as `wasm-init.ts` does now. One tarball with no install scripts. ESM works. Also runs on Deno, Bun and Workers. |
| Node, heavy | napi-rs (optional, later) | Native speed, about 1.5–3× faster than WASM. Needs per-platform `optionalDependencies`, about 8 targets, and has no Deno or edge support. Add it only on real demand, with WASM as the fallback. |
| CLI / Tauri / reebe / proxy-rs | Direct crate dependency | No bridge cost. `apps/desktop` and `proxy-rs` already build Rust. |
| Python | PyO3 + maturin, abi3 wheels | Medium cost. Add on demand. |
| JVM / Swift / Kotlin / Go | UniFFI or cbindgen | Add on demand. |

**Types and data.**
- Generate `.d.ts` from Rust structs with `tsify`. This replaces today's `any` returns and the regex export check in `scripts/build-wasm.mjs`.
- Send small payloads with serde-wasm-bindgen.
- For large models, return a JSON string and parse it in JS, or keep a handle on the Rust side and query it lazily.
- Keep the WASM API sync and pure (bytes in, data out). All I/O (fetch, deploy, fs) stays in TS.

## 5. Parity strategy

Use the TS implementation as the oracle until each module matches.

1. Create one shared `fixtures/` corpus (BPMN, DMN, Form, FEEL expression tables as JSON). Both `vitest` and `cargo test` read it.
2. Round-trip golden tests: parse, then serialize, then compare bytes with the TS output.
3. Run the official DMN TCK against both FEEL implementations. Port the Camunda parity suite. Run differential proptests while both implementations exist.
4. Take snapshots of lint findings, migrate output, layout coordinates and compact/text output.
5. Put each module behind a flag in the facade (TS or WASM). Delete the TS version only when its suite passes in CI.

## 6. Plan (one Rust-capable developer, rough)

| Phase | Work | Person-weeks |
|---|---|---|
| 0 Gate | Size profile for reebe-wasm, bench FEEL and parse against TS, decide go/no-go | 1 |
| 1 Harness | Shared fixtures, cargo workspace, CI (rust-cache, wasm-pack, binaryen), `check:consumable` smoke tests for Node `initSync` and Vite | 3–4 |
| 2 FEEL | Unify on `bpmnkit-feel`, pass the TCK, give reebe-feel a re-export, add a TS facade | 3–4 |
| 3 BPMN I/O | xml + model + parser + serializer with DI and lossless writing | 6–8 |
| 4 Batch tools | camunda-compat, c7 migrate, text/compact, lint/optimize, dmn, form, templates | 13–16 |
| 5 Layout | auto-layout and dmn-layout, with exact coordinate parity | 5–7 |
| 6 Engine facade | `@bpmnkit/engine` on reebe-wasm, close the gaps (ad-hoc, clock, coverage, dry-run, AI mocks), drop `instance.ts` | 3–5 |
| 7 Text packages | patterns, ascii, markdown, flow, profiles | 3–4 |
| 8 Builder/ops | Rust ops under the TS fluent builder | 4–5 |
| Later | Rust CLI (needs the core first; plugin bridge open) 12–20 · finish proxy-rs 6–10 · Python/napi on demand | — |

The phases from gate through builder/ops are about 41–54 person-weeks. Each phase ships on its own, so you can stop after any of them.

## 7. Risks

- **License.** Reebe is Apache-2.0, while the rest of the repo and the `@bpmnkit/reebe-wasm` npm package are MIT. Resolved by the dual license (§8).
- **Contributors.** The repo is mostly TS, Preact and Astro. Rust work narrows the pool of contributors. Reebe gives some base.
- **Dev loop and release.** A WASM rebuild is slower than `tsc`. Every core consumer gets a build step, so turbo inputs must include the Rust paths.
- **Plugins.** TS plugins are sync today. Any plugin API that moves behind WASM and becomes async is a breaking change, so keep the plugin surface in TS.
- **CLI plugins.** A Rust `casen` would need a Node bridge for TS plugins, or would have to drop them. This is the reason the CLI stays in TS for now.
- **Bundle and cold start.** Not measured yet. That is why phase 0 exists.

## 8. Decisions (2026-11-04)

1. **Goal: both** native tooling and browser speed. Do the full core port (phases 0–8). Phase 0 still gates it.
2. **License: dual `MIT OR Apache-2.0`** for the shared crates, which is the Rust ecosystem norm. MIT keeps the npm packages as they are. Apache-2.0 adds a patent grant. Reebe has a single author, so it can be relicensed to the dual license with no outside consent. Do this before code moves (phase 1).
3. **Rust CLI: yes.** It stays in "Later", after the core. Its first step is a plugin-bridge spike. Option A: the Rust binary runs TS plugins in a Node subprocess over JSON-RPC. Option B: plugins are WASM components. Pick one before the port. Keep TS `casen` until the Rust CLI reaches parity.
