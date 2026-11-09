# casen check — Options

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

---
Source: https://bpmnkit.com/docs/cli/check
