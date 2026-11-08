# Build an Executable Camunda Process — How do I label a gateway's Yes and No flows?

Open a `branch` after the gateway and call `label` for the text shown on the sequence flow,
`flowId` for the flow's own id, and `condition` for the FEEL expression. The branch id
(`"yes"`) is only the builder's handle and stays separate from the flow label, so the label
reads "Yes" while the id stays stable. Use `connectTo` to loop a branch back to an earlier
element.

```typescript
.exclusiveGateway("Gateway_UserSatisfied", { name: "User satisfied?" })
.branch("yes", (b) =>
	b.label("Yes").flowId("Flow_Yes").condition("=userSatisfied")
		.endEvent("EndEvent_UserSatisfied", { name: "User satisfied" }),
)
.branch("no", (b) =>
	b.label("No").flowId("Flow_No")
		.condition("=userSatisfied = null or userSatisfied = false")
		.connectTo("Gateway_RunAgent"),
)
```

---
Source: https://bpmnkit.com/docs/guides/executable-camunda-process
