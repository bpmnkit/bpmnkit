# BPMN Kit Text — element reference — Events and exceptions

An event is `start`, `end`, `catch` (waits), `throw` (sends) or `boundary` (sits on a task). Add a
trigger after a colon: `start:message`, `end:error`, `catch:timer`. The triggers are `timer`,
`message`, `signal`, `error`, `escalation`, `terminate`, `conditional`, `compensate`, `link` and
`cancel`. `event` reads as a `catch`. `link` is the one trigger you cannot use: Text has no attribute
for the link name, so the parser reports it and draws a plain event. Use `.intermediateThrowEvent(id, { linkName })` in Fluent.

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
