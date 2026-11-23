# BPMN Kit Fluent — the fluent builder — Cheat sheet

| Method | What it does |
|---|---|
| `Bpmn.createProcess(id)` | Start a new `ProcessBuilder`; `.name(text)` names it |
| `Bpmn.continueProcess(defs, processId)` / `ProcessBuilder.from(defs, processId)` | Continue a parsed model instead of replacing it |
| `Bpmn.createDiagram(id?)` | `DiagramBuilder`: several processes in one document (`.process(id, p => …)`) |
| `.startEvent(id?, options?)` / `.endEvent(id?, options?)` | Start and end events |
| `.serviceTask(id, options)` / `.userTask(id, options?)` | Tasks; also `scriptTask`, `sendTask`, `receiveTask`, `businessRuleTask`, `manualTask`, `task`, `callActivity` |
| `.exclusiveGateway` / `.parallelGateway` / `.inclusiveGateway` `(id, options?)` | XOR, AND, OR gateways |
| `.branch(name, b => …)` | One outgoing path of the preceding gateway |
| `.condition(expr)` / `.defaultFlow()` | Inside a branch: FEEL condition, or the fallthrough flow |
| `.connectTo(targetId)` | Wire the current path to an existing element (loops, explicit joins) |
| `.lane(id, options?)` / `.participant(id, options?)` | Lanes and the pool the process is drawn in |
| `.withAutoLayout()` | Compute shapes and waypoints before `build()` |
| `.build(options?)` | Return the `BpmnDefinitions` (deploy-gated) |
| `.at(nodeId)` / `.insertAfter(nodeId)` | Continue mode: extend from an open node, or splice into the path after one |
| `Bpmn.export(defs)` / `Bpmn.parse(xml)` | Model → XML, XML → model |

Full option lists: [packages/core](/docs/packages/core).

---
Source: https://bpmnkit.com/docs/guides/fluent-builder
