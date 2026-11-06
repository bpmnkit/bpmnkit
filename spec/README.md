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
| `compat-rules.json` | `schema/compat-rules.schema.json` | `packages/core/src/generated/camunda-compat-data.ts` | `bpmnkit_spec::compat` |
| `templates/connectors.json` | `schema/connector-templates.schema.json` | `packages/core/src/connectors/templates/generated.ts`, `packages/connectors/src/templates/generated.ts` | `bpmnkit_spec::templates::CONNECTOR_TEMPLATES_JSON` (raw JSON) |
| `elements/<family>.json` | `schema/elements.schema.json` | `packages/core/src/generated/form-elements.ts` (form only) | `bpmnkit_spec::elements` (form only) |

`lint-rules.json` holds bpmnlint's rule names, the `correctness` / `recommended` presets, and each native
rule's category and `standard-size` defaults. The check functions and their messages (template literals)
stay in `bpmnlint-rules.ts`: messages are behaviour, not data. `all` is derived (every rule at `error`).

`compat-rules.json` holds the Camunda 8 compatibility tables (element, implementation, timer, feature, FEEL
built-in and inbound-connector support per version, and the plugin's rules), with the plugin/feel-builtins
`source` attribution. Timer support is a 2x2 table per property (interrupting x in an event sub-process);
`camunda-compat-data.ts` stays a facade that rebuilds the `TIMER_SUPPORT` functions from it.

`templates/connectors.json` is the Camunda marketplace's connector templates, whole (about 3.5 MB, Biome-ignored).
`pnpm update-connectors` fetches the registry and writes this file (plus `catalog-meta.json`), then runs spec-gen,
which splits each template into the core file (binding/validation keys) and the connectors file (panel-only keys).
Edit the JSON, not the two TS files. Rust embeds the JSON text rather than generating literals.

## Element definitions

`elements/<family>.json` describes one family of elements; `schema/elements.schema.json` documents every field.
Today only `form.json` exists and is generated (`EMITTED` in `scripts/spec-gen/elements.mjs`); the format is built
for phase 4 (`bpmn.json`, `zeebe.json`, `dmn.json`).

- Header: `family` (lower case), optional `namespace` (`prefix` + `uri`), `source` (attribution and version),
  `traits` (the family's trait vocabulary, each with a description), `elements`.
- Element: `name`, `description`, `extends` (same family, or `family:name`), `abstract`, `attributes`, `children`,
  `allowedIn` (parent element names, `family:name` across families), `traits`.
- Attribute: `name`, `type` (`string|boolean|integer|number|expression|id|idref|enum`), `values` (enum only),
  `default`, `required`.
- Child: `element` and `multiplicity` (`1`, `0..1`, `0..*` default, `1..*`).
- Traits are free-form flags, declared per family and checked by the generator. Form uses `keyed` (binds a value
  to `key`), `options` (needs `values`/`valuesKey`/`valuesExpression`) and `scope` (container whose `path` opens a data scope).

Phase 4 extends it without changing the format: Zeebe extension elements become elements with
`allowedIn: ["bpmn:serviceTask", ...]` (what `ZEEBE_PLACEMENT` holds), `namespace` zeebe, attributes, and `children`
(e.g. `ioMapping` > `input`). BPMN/DMN add `extends` and `abstract` for the type hierarchy. New per-family
concepts go in as new optional fields or traits, then a Rust trait enum and `EMITTED` entry per family.

## Adding an area

1. Write `spec/<area>.json` and `spec/schema/<area>.schema.json` (the generator's validator
   supports type, enum, const, properties, required, additionalProperties, items, minItems,
   uniqueItems, minLength, pattern, anyOf, propertyNames and local `$ref`).
2. Add `scripts/spec-gen/<area>.mjs` exporting `source`, `schema` and
   `generate(spec) → { "<repo path>": "<content>" }`, and list it in `AREAS` in `scripts/spec-gen.mjs`.
3. TS output goes in a `src/generated/` folder (Biome-ignored). Rust output goes in
   `crates/bpmnkit-spec/src/generated/` (a `#[rustfmt::skip]` module); the hand-written module
   beside it holds the types and a test that loads the JSON and compares it with the generated table.
