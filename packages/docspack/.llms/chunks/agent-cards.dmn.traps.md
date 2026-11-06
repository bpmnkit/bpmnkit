# DMN agent card — Traps

- **The process calls the decision id.** A BPMN `businessRuleTask(id, { decisionId: "risk", resultVariable: "risk" })` must use the argument of `createDecisionTable("risk")`, not the DMN `definitions` id, the file name or `.name()`. Ids are unique across the cluster: a second file with decision `risk` deploys as a new version of the same decision.
- **Deploy the `.dmn` before an instance reaches the task.** The call binds to the latest deployed version: `casen deploy deploy risk.dmn` first.
- **Hit policy `UNIQUE` is the default.** Two matching rules is a runtime incident. Use `FIRST` for a catch-all last row, or `COLLECT` for a list.
- **Input entries are FEEL unary tests, outputs are FEEL expressions,** and neither starts with `=`. `-` matches anything; `> 1000`, `[1..10]`, `"DE"`, `not("DE", "AT")`. A string output needs quotes: `'"high"'`, not `"high"`.
- **Result shape.** With one output column the result variable holds the value; with several it holds an object keyed by output `name`; `COLLECT` gives a list.
- **Edit with the preserving writer.** Write `exportDmnPreserving(original, edited)`; `Dmn.export` alone reformats the file and its diagram.

---
Source: https://bpmnkit.com/docs/agent-cards/dmn
