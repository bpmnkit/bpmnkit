# DMN agent card — Validate

```sh
bpmnkit check risk.dmn order.bpmn --deploy   # DMN lint + every decisionId in the BPMN resolves
```

`bpmnkit check <files...>` takes `.bpmn`, `.dmn` and `.form` together and exits 1 on errors; add `--json` for an agent loop. The script above also re-parses the file and checks the decision id.

Related cards: `bpmnkit agent-card bpmn`, `bpmnkit agent-card form`. More: `npx bpmnkit-docs ask "decision table hit policy"`.

---
Source: https://bpmnkit.com/docs/agent-cards/dmn
