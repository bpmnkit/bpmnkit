# spec/

Single-source data shared by the TypeScript packages and the Rust crates
(`doc/rust-rewrite-proposal.md` §4.3). Edit the JSON here, then run:

```sh
pnpm spec:gen           # validate each file against spec/schema/, then write the generated code
pnpm spec:gen --check   # fail if any generated file is stale (writes nothing)
```

The generated files are committed and start with an `@generated` line. CI runs `pnpm spec:gen`
followed by `git diff --exit-code spec/ crates/bpmnkit-spec packages/`, so they cannot drift.
Behaviour (evaluation, rule logic) stays hand-written on each side; only data lives here.

| File | Schema | TS output | Rust output |
|---|---|---|---|
| `feel-builtins.json` | `schema/feel-builtins.schema.json` | `packages/feel/src/generated/builtin-signatures.ts` | `bpmnkit_spec::feel` |
| `lint-rules.json` | `schema/lint-rules.schema.json` | `packages/core/src/generated/lint-rules.ts` | `bpmnkit_spec::lint` |

`lint-rules.json` holds bpmnlint's rule names, the `correctness` / `recommended` presets, and each native
rule's category and `standard-size` defaults. The check functions and their messages (template literals)
stay in `bpmnlint-rules.ts`: messages are behaviour, not data. `all` is derived (every rule at `error`).

## Adding an area

1. Write `spec/<area>.json` and `spec/schema/<area>.schema.json` (the generator's validator
   supports type, enum, const, properties, required, additionalProperties, items, minItems,
   uniqueItems, minLength, pattern, anyOf, propertyNames and local `$ref`).
2. Add `scripts/spec-gen/<area>.mjs` exporting `source`, `schema` and
   `generate(spec) → { "<repo path>": "<content>" }`, and list it in `AREAS` in `scripts/spec-gen.mjs`.
3. TS output goes in a `src/generated/` folder (Biome-ignored). Rust output goes in
   `crates/bpmnkit-spec/src/generated/` (a `#[rustfmt::skip]` module); the hand-written module
   beside it holds the types and a test that loads the JSON and compares it with the generated table.
