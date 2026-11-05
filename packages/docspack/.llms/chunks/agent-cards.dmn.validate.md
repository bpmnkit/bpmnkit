# DMN agent card — Validate

The script re-parses the file and checks the decision id, which is what the process depends on. Before deploying, check that every `decisionId` in your `.bpmn` files names a decision in a `.dmn` file. A dedicated DMN lint may ship in your `casen` version: see `casen --help`.

Related cards: `casen agent-card bpmn`, `casen agent-card form`. More: `npx bpmnkit-docs ask "decision table hit policy"`.

---
Source: https://bpmnkit.com/docs/agent-cards/dmn
