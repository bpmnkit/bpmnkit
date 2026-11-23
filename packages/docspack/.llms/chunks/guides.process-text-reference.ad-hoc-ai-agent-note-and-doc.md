# BPMN Kit Text — element reference — Ad-hoc, AI agent, note and doc

An `adhoc` node is an ad-hoc sub-process: an AI agent that chooses among its tools. A tool is a task
with `inside=<agent id>` and no flows of its own. `doc` is the description the agent chooses a tool by.
`note` annotates a node.

```bpmnkit-text
# Agent with a tool
ask[start Question asked] > agent[adhoc Answer with tools] > done[end Answered]
users[service Look up users | job=lookup-users inside=agent]
doc users: Returns the list of sample users
note agent: Picks a tool by its description
```

```typescript
const defs = Bpmn.createProcess("agent-process")
  .name("Agent with a tool")
  .startEvent("ask", { name: "Question asked" })
  .adHocSubProcess(
    "agent",
    (sub) => sub.serviceTask("users", { name: "Look up users", taskType: "lookup-users", documentation: "Returns the list of sample users" }),
    { name: "Answer with tools" },
  )
  .annotate("agent", "Picks a tool by its description")
  .endEvent("done", { name: "Answered" })
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
