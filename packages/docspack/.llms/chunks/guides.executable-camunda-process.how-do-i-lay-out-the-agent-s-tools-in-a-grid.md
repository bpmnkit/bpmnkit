# Build an Executable Camunda Process — How do I lay out the agent's tools in a grid?

Pass `toolGrid` as an option to `adHocSubProcess`. `columns` sets the width and `fill` sets
the order: `"column"` fills down each column first, `"row"` fills across. Tools are placed in
declaration order. Add `annotate` to attach a text annotation to an element; `side` picks which
edge it hangs from.

```typescript
.adHocSubProcess("AI_Agent", (sub) => { /* tools */ }, {
	name: "AI Agent",
	toolGrid: { columns: 2, fill: "column" },
})
.annotate("FetchSafeJoke", "Each task you add is a capability of the agent.", { side: "below" })
.withAutoLayout()
```

---
Source: https://bpmnkit.com/docs/guides/executable-camunda-process
