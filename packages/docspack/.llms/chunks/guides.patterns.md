# Pattern Library

The pattern library (`@bpmnkit/patterns`) provides domain knowledge for common business
processes. When you run `/bpmnkit:implement`, Claude checks the library for a matching
pattern (`casen pattern list`/`get`) and uses its readme and worker specs as context while
writing the `ProcessPlan` — the pattern's own `template` field is a compact diagram that
predates the plan/synth pipeline. It expands (`expand`) to a model that deploys on Camunda 8,
but it is a structural reference, not something pasted in directly.

Patterns are hints, not templates. Claude adapts them to the specific request and ignores
them entirely when nothing relevant matches.

---
Source: https://bpmnkit.com/docs/guides/patterns
