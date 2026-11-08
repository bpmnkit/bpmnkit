---
title: casen check
description: Check .bpmn, .dmn and .form files in one call — BPMN lint, DMN and form validation and the references between them, each finding with a rule id, element id and a concrete fix.
sidebar:
  order: 3
---

`casen check` is the gate to run before you deploy, or after every edit in an agent loop.
It takes any mix of BPMN, DMN and form files and checks each one, then the references
between them. It exits non-zero when there is an error.

```sh
casen check order.bpmn review.form discount.dmn
```

```
order.bpmn
  ⚠ check/unresolved-form [ReviewOrder] "ReviewOrder" links formId "review", which none of the checked forms has.
      fix: Set formId to one of "review-form", or check the form that has id "review" too.
discount.dmn
  ✖ dmn/feel-syntax [InputEntry_3] Input entry of rule "Rule_2" is not valid FEEL unary tests: Unexpected token '<' (at 9) in `>= 10 and < 20`.
      fix: Write unary tests: a value ("gold", 42), a comparison (> 10), a range ([1..5]), a list ("a","b"), not(...), or - for any.

2 findings: 1 error, 1 warning
```

## Options

| Option | Description |
|--------|-------------|
| `--deploy` | Deploy-readiness gate. Camunda 8 rules run even on a model that names no platform, user tasks need a form, and cross-file references are errors. Each BPMN file also goes through the [deploy gate](/docs/guides/deploy-gate) on its exact bytes (XML schema included), so anything `casen deploy` would refuse is reported here first. Only errors are shown. |
| `--sketch` | Sketch profile. Skips every Camunda 8 deployability rule on BPMN files. |
| `--user-task-forms require\|off` | Report user tasks that have no form, or not. Default: `require` with `--deploy`, `off` otherwise. |
| `--json` | Print `{ ok, errors, warnings, findings }`. |
| `--no-bpmnlintrc` | Ignore the project's `.bpmnlintrc`. |

Each finding has the same fields for every file kind:

```json
{
  "file": "discount.dmn",
  "kind": "dmn",
  "rule": "dmn/unresolved-requirement",
  "severity": "error",
  "elementId": "Decision_discount",
  "message": "<requiredDecision href=\"#tier\"> on \"Decision_discount\" points at a <inputData>, not a <decision>.",
  "fix": "Use <requiredInput> for input data."
}
```

## Profiles

| Profile | Use it when | What runs |
|---------|-------------|-----------|
| default | You edit a model that targets Camunda 8 | Every rule. Camunda 8 rules run only when the model names a platform (`modeler:executionPlatform`). A user task without a form is not reported. |
| `--sketch` | You draw a process before it targets an engine | Structure, flow, naming, FEEL syntax. No `deploy/`, `compat/`, `connector/` or `agentic/` rules, even if the model names a platform. |
| `--deploy` | You are about to deploy | Every rule, errors only. A user task without a form is an error (`compat/user-task-definition`); `--user-task-forms off` turns it off. Outside `--deploy`, `--user-task-forms require` reports it as a warning. A `formId` or `decisionId` that none of the checked files defines is an error. |

Zeebe deploys a user task that has no form. So outside the deploy gate the "user task needs a
form" rule is off: it would push you to invent a form reference only to clear a warning. Turn
it on with `--user-task-forms require`. `casen lint lint` has the same `--profile sketch|deploy`
and `--user-task-forms` options.

## What is checked

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

The same checks are in `@bpmnkit/core` as `lintDmn(xml)` and `lintForm(json)`.
