# casen check — What is checked

**BPMN** — the XML is well-formed, then every [`casen lint`](/docs/cli/casen) rule runs
(a project `.bpmnlintrc` is honoured).

**DMN**

| Rule | Severity | What it means |
|------|----------|---------------|
| `dmn/malformed-xml` | error | The XML does not parse |
| `dmn/not-dmn` | error | The root is not `<definitions>` |
| `dmn/duplicate-id` | error | Two elements share an id |
| `dmn/missing-id` | error | A decision, input data, BKM or knowledge source has no id |
| `dmn/no-decision` | error | The document has no decision |
| `dmn/unresolved-requirement` | error | A `requiredDecision`, `requiredInput`, `requiredKnowledge` or `requiredAuthority` href points at nothing, or at the wrong kind of element |
| `dmn/requirement-cycle` | error | Decisions require each other in a cycle |
| `dmn/decision-no-logic` | error | A decision has no decision table and no literal expression |
| `dmn/empty-expression` | error | A literal expression is empty |
| `dmn/invalid-hit-policy` | error | The hit policy is not a DMN hit policy |
| `dmn/invalid-aggregation` | error | An unknown aggregation, or an aggregation without `COLLECT` |
| `dmn/no-output` | error | A decision table has no output |
| `dmn/missing-output-name` | error | A table with several outputs has an output with no name |
| `dmn/empty-input-expression` | error | An input column has no expression |
| `dmn/rule-entry-count` | error | A rule's entries do not match the table's columns |
| `dmn/feel-syntax` | error | An input expression, input entry (unary tests), output entry or literal expression is not valid FEEL |
| `dmn/invalid-type-ref` | warning | A `typeRef` is not a DMN/FEEL type |

**Forms** (form-js JSON)

| Rule | Severity | What it means |
|------|----------|---------------|
| `form/invalid-json` | error | The file is not JSON |
| `form/invalid-schema` | error | Not `{ id, type: "default", components: [] }`, a component with no type, or a bad button action |
| `form/missing-id` | error | The form or a component has no id |
| `form/duplicate-id` | error | Two components share an id |
| `form/missing-key` | error | An input field is bound to no variable |
| `form/invalid-key` | error | A key is not a variable name or dotted path |
| `form/duplicate-key` | error | Two fields bind the same key in the same data scope |
| `form/missing-options` | error | A select, radio, checklist or taglist has no options |
| `form/missing-expression` | error | An expression field has no expression |
| `form/feel-syntax` | error | A property starting with `=` (a condition, an expression, a label) is not valid FEEL |
| `form/invalid-validation` | error | A `validate.pattern` is not a regular expression, or min is above max |
| `form/conditional-not-feel` | warning | `conditional.hide` has no leading `=`, so it is not evaluated |
| `form/unknown-type` | warning | A component type form-js does not provide |

**Between files** — checked only when at least one file of the referenced kind is given:

| Rule | Severity | What it means |
|------|----------|---------------|
| `check/unresolved-form` | warning, error with `--deploy` | A user task's `formId` is not the id of a checked form |
| `check/unresolved-decision` | warning, error with `--deploy` | A business rule task's `decisionId` is not a decision in a checked DMN file |

---
Source: https://bpmnkit.com/docs/cli/check
