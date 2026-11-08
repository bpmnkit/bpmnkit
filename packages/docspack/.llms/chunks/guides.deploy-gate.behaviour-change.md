# The Deploy Gate — Behaviour change

`@bpmnkit/core` 1.10 refuses generated output that Zeebe rejects. That output was a bug: it
looked fine until a deployment failed. Callers that relied on it have three ways forward:

1. Complete the input. The error names each element and rule.
2. Pass `placeholders: true` (CLI `--placeholders`) to get a deployable model with documented
   values to replace.
3. Pass `validate: false` (CLI `--no-validate`) for a draft that is not meant to deploy, or a model
   for another engine.

The serializer changed in one place: documentation on `<bpmn:definitions>` is not allowed by the
BPMN schema (Zeebe refuses it), so it is written inside a `<bpmn:extension>` and read back from
there.

---
Source: https://bpmnkit.com/docs/guides/deploy-gate
