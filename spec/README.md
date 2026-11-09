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
| `zeebe-rules.json` | `schema/zeebe-rules.schema.json` | `packages/core/src/generated/zeebe-rules.ts` | `bpmnkit_spec::zeebe` |
| `templates/connectors.json` | `schema/connector-templates.schema.json` | `packages/core/src/connectors/templates/generated.ts`, `packages/connectors/src/templates/generated.ts` | `bpmnkit_spec::templates::CONNECTOR_TEMPLATES_JSON` (raw JSON) |
| `elements/<family>.json` | `schema/elements.schema.json` | `packages/core/src/generated/{form,bpmn,zeebe}-elements.ts` | `bpmnkit_spec::elements` (`FORM_ELEMENTS`, `BPMN_ELEMENTS`, `ZEEBE_ELEMENTS`, `ZEEBE_ALLOWED_IN`) |

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

`zeebe-rules.json` lists every rule Zeebe applies when a BPMN is deployed (`doc/deployability/zeebe-rules.md`):
id, `name` (finding id `zeebe/<name>`), the elements, Zeebe's messages, the Camunda versions it applies to
(`since`/`until`), `kind` (static, feel, context), severity, and `check`: how BPMN Kit decides it (`model`:
`validateDeployable`; `xml`: `validateDeployableXml` on the text; `context`: only with a resolver for the
other resources; `none`: not decidable from one BPMN, with a `note`). Umbrella rules name the specific rules
that report them in `coveredBy`. The checks are in `packages/core/src/bpmn/zeebe-validate` and
`crates/bpmnkit-compat/src/zeebe`.

## Element definitions

`elements/<family>.json` describes one family of elements; `schema/elements.schema.json` documents every field.
`form.json`, `bpmn.json` and `zeebe.json` exist and are generated (`EMITTED` in `scripts/spec-gen/elements.mjs`);
`dmn.json` is still to come. Each emitted family gets `<UPPER>_ELEMENT_NAMES` and `<UPPER>_ELEMENTS_BY_TRAIT` in TS
and a `<UPPER>_ELEMENTS` static plus a `<Family>Trait` enum in Rust. A family whose elements have `allowedIn` also
gets a placement table, `<UPPER>_ALLOWED_IN` (TS record, Rust `&[(&str, &[&str])]`), keyed by `prefix:name`.

- Header: `family` (lower case), optional `namespace` (`prefix` + `uri`), `source` (attribution and version),
  `traits` (the family's trait vocabulary, each with a description), `elements`.
- Element: `name`, `description`, `extends` (same family, or `family:name`), `abstract`, `attributes`, `children`,
  `allowedIn` (parent element names, `family:name` across families), `traits`.
- Attribute: `name`, `type` (`string|boolean|integer|number|expression|id|idref|enum`), `values` (enum only),
  `default`, `required`.
- Child: `element` and `multiplicity` (`1`, `0..1`, `0..*` default, `1..*`).
- Traits are free-form flags, declared per family and checked by the generator. Form uses `keyed` (binds a value
  to `key`), `options` (needs `values`/`valuesKey`/`valuesExpression`) and `scope` (container whose `path` opens a data scope).

- `bpmn.json` (BPMN 2.0.2, XML local names) uses `extends` and `abstract` for the hierarchy (`baseElement` >
  `flowElement` > `flowNode` > `activity` > `task` > `serviceTask`, `event` > `catchEvent`/`throwEvent`, `gateway`,
  `eventDefinition`). Its traits reproduce the parser's type sets: `flowElement` (FLOW_ELEMENT_TYPES), `event`,
  `loop`, `container`, `eventDefinition`, plus `defaultFlow`. `eventSubProcess` is model-only (a `subProcess` with
  `triggeredByEvent`). Traits are read from an element's own `traits` and are not computed through `extends`, so
  they sit on the concrete elements and never on abstract ones.
- `zeebe.json` has one element per Zeebe extension (attributes, `children` such as `ioMapping` > `input`) and
  `allowedIn` with BPMN parents (`bpmn:serviceTask`, ...). `allowedIn` is derived from the vendored moddle descriptors:
  `pnpm --filter @bpmnkit/core generate:placement` writes it into this file (the rest is hand-written), then
  `pnpm spec:gen` regenerates the code. Elements the descriptor places nowhere (`header`, `subscription`,
  `properties`, `property`) have none, and `isZeebePlacementAllowed` treats them as allowed.
- TS consumers: `ZEEBE_PLACEMENT` (`packages/core/src/bpmn/zeebe-placement.ts`) is `ZEEBE_ALLOWED_IN`, and the parser's
  `FLOW_ELEMENT_TYPES`, `EVENT_TYPES`, `LOOP_TYPES`, `CONTAINER_TYPES` and `EVENT_DEFINITION_TYPES` are `Set`s built
  from `BPMN_ELEMENTS_BY_TRAIT`. The Rust parser can read the same data from `bpmnkit_spec::elements`.
- New per-family concepts go in as new optional fields or traits, then a Rust trait enum and `EMITTED` entry per family.

## Adding an area

1. Write `spec/<area>.json` and `spec/schema/<area>.schema.json` (the generator's validator
   supports type, enum, const, properties, required, additionalProperties, items, minItems,
   uniqueItems, minLength, pattern, anyOf, propertyNames and local `$ref`).
2. Add `scripts/spec-gen/<area>.mjs` exporting `source`, `schema` and
   `generate(spec) → { "<repo path>": "<content>" }`, and list it in `AREAS` in `scripts/spec-gen.mjs`.
3. TS output goes in a `src/generated/` folder (Biome-ignored). Rust output goes in
   `crates/bpmnkit-spec/src/generated/` (a `#[rustfmt::skip]` module); the hand-written module
   beside it holds the types and a test that loads the JSON and compares it with the generated table.
