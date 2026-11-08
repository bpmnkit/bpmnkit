# @bpmnkit/core — Installation — Ad-hoc sub-processes: children are a set, not a chain

Sequential calls in a builder chain auto-connect with sequence flows. Inside
`.adHocSubProcess()` they do not: BPMN defines an ad-hoc sub-process's children as an unordered
set of independently-invocable activities, and Camunda 8's agentic AI runtime reads that
structurally — a child *without* an incoming flow is an LLM-invocable tool, a child *with* one
is part of an internal sub-flow and not a tool at all.

```typescript
.adHocSubProcess("agent", (s) => {
  s.serviceTask("listUsers",  { taskType: "io.camunda:http-json:1" });
  s.serviceTask("loadUser",   { taskType: "io.camunda:http-json:1" });
  s.serviceTask("createUser", { taskType: "io.camunda:http-json:1" });
}, { name: "Handle request" })
// → three tools, no sequence flows, no <bpmndi:BPMNEdge> between them
```

Auto-chaining them produced a file that lints clean and deploys, while the agent saw one tool
and a two-step sub-flow — so the default is off rather than opt-out.

An internal sub-flow inside the container stays expressible: say so with `.connectTo()`, which
still creates a flow from the cursor.

```typescript
.adHocSubProcess("agent", (s) => {
  s.serviceTask("listUsers", { taskType: "io.camunda:http-json:1" });   // a tool
  s.serviceTask("step1", { taskType: "work" }).connectTo("step2");      // an internal sub-flow
  s.serviceTask("step2", { taskType: "work" });
})
```

Each child's LLM-facing description is its `documentation`, which every builder method accepts:

```typescript
s.serviceTask("listUsers", {
  taskType: "io.camunda:http-json:1",
  documentation: "Call this to retrieve all users. Returns id, name, email.",
});
```

With `.withAutoLayout()`, unconnected children are packed into a grid in declaration order,
row by row in `ceil(sqrt(n))` columns. `toolGrid` fixes the column count, and
`fill: "column"` reads the order top to bottom instead. Like the annotation `side` below, it
steers the layout only and is not written to the XML.

```typescript
.adHocSubProcess("agent", (s) => {
  s.serviceTask("users",    { taskType: "x" });   // left column, top
  s.serviceTask("recipes",  { taskType: "x" });   // left column, bottom
  s.serviceTask("joke",     { taskType: "x" });   // right column, top
  s.serviceTask("products", { taskType: "x" });   // right column, bottom
}, { toolGrid: { columns: 2, fill: "column" } })
.annotate("joke", "Each task is a capability of the agent.", { side: "below" })
```

`.annotate(elementId, text, { side: "above" | "below" })` overrides the side the layout picks
for a text annotation; it still steps clear of shapes and other annotations on that side. Call
it on the process builder, also for an element inside a sub-process: annotations added with
`annotate()` inside a sub-process callback get no diagram shape from the auto layout.

---
Source: https://bpmnkit.com/docs/packages/core
