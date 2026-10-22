# @bpmnkit/core — Installation — Forms, mappings and branch flows

- `multiInstance: { collection, elementVariable, outputCollection, outputElement, completionCondition, isSequential }`
  runs any activity once per item: `serviceTask`, `userTask`, `scriptTask`, `sendTask`,
  `receiveTask`, `businessRuleTask`, `callActivity` and sub-processes. The output options need
  `collection`.
- `executionListeners: [{ eventType: "start", type: "audit", retries: "3" }]` on any activity,
  event or gateway writes `zeebe:executionListeners`; `taskListeners` does the same for a
  `userTask` (`zeebe:taskListeners`) and throws a `ZeebePlacementError` anywhere else. The
  `update` patch replaces either list; `[]` removes it.
- `startEvent(id, { formId })` writes `zeebe:formDefinition formId`. Camunda uses start forms
  only on the process's none start event, so do not set it on message, timer or signal starts.
- `userTask(id, { ioMapping, taskHeaders, zeebeProperties, modelerTemplate,
  modelerTemplateVersion })` take the same shapes as `serviceTask`, for example
  `ioMapping: { inputs: [{ source: "=order", target: "order" }] }`.
- `.branch("no", (b) => b.label("No").flowId("Flow_No")...)`: `label()` sets the flow's name
  (otherwise the branch id), `flowId()` keeps the id you chose. The build throws when a
  `flowId` repeats another element or flow id anywhere in the process, nested sub-processes
  included.
- `buildAiAgentSubProcess` builds the v1 job-worker agent. For the v2 template of Camunda 8.10
  (`io.camunda.connectors.agenticai.ai-agent-subprocess.v2`), build the ad-hoc sub-process
  yourself and apply the template after `build()` with `applyTemplates` from
  `@bpmnkit/core/connectors`.

---
Source: https://bpmnkit.com/docs/packages/core
