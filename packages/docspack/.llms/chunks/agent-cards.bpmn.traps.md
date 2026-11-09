# BPMN agent card — Traps

- **Camunda 8.10 is the default target.** To target an older cluster, call `.executionPlatformVersion("8.8.0")` so lint checks that version.
- **User tasks default to job-worker tasks**, which 8.10 deprecates. Pass `zeebeUserTask: true` for a Camunda user task.
- **Deploy ids.** The engine keys a process by its process id (`createProcess("order")`), a decision by its `<decision id>`, a form by its JSON `id`. File names and display names do not count. `formId` and `decisionId` must equal those ids exactly; by default they bind to the latest deployed version, so deploy the `.dmn` and `.form` before an instance reaches the task. Redeploying the same id makes a new version.
- **Reference a DMN decision by its decision id**, not the DMN `definitions` id, the file name or the decision name.
- **Edit with the preserving writer.** For an existing file, `Bpmn.parse` it, change the model, and write `exportPreserving(original, edited)`. Rebuilding it with `withAutoLayout()`, or `Bpmn.export` alone, moves every shape and reformats the diff.
- **Place only the new shapes.** Elements, flows and message flows you add to an existing file have no shapes until `placeMissingShapes(edited)` gives them some: next to their neighbours, inside their pool, lane or sub-process, without moving an existing shape. Call it right before `exportPreserving`; `withAutoLayout()` or `applyAutoLayout()` on an edit moves every shape. Put a new node in a lane by adding its id to that lane's `flowNodeRefs`, or it joins its neighbour's lane.
- FEEL in the builder starts with `=` (`"=amount > 1000"`); a value without `=` is a literal string.
- Unknown option names are silently dropped: `timer: { duration }` does nothing; use `timerDuration`.

- **`build()`, `expand()` and `Bpmn.export` refuse what Camunda 8 cannot deploy**: a gateway branch without `condition`/`defaultFlow`, a task or message throw/end event without `taskType`, a message without name or `correlationKey`, a timer without a time, anything after an end event. The `DeployabilityError` message has one line per problem, `- <id>: <message> (zeebe/<rule>)`: fix each. `{ placeholders: true }` fills documented values to replace before deploying; `{ validate: false }` only for a draft.

---
Source: https://bpmnkit.com/docs/agent-cards/bpmn
