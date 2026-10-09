# Agent tool output key — How a tool can set `toolCallResult`

The result can be set anywhere in the tool's flow through several channels:

- **Output mapping**: Target `toolCallResult` or one of its fields, such as `toolCallResult.statusCode`.
- **Connectors**: Use the **Result variable** or **Result expression** field, for example, `= { toolCallResult: response.body }`. This is the only available channel because connectors cannot read process variables.
- **Script tasks and business rule tasks**: Set the **Result variable** to `toolCallResult`.

### Avoid overwrites when several elements contribute

Assigning a value to `toolCallResult` twice overwrites the first value:

![Two activities in a tool's sub-flow, connected by a sequence flow, both mapping an output to toolCallResult: the second activity's value silently replaces the first](./img/agent-tool-output-key/overwrite.png)

To add a field without overwriting the existing value, use `context put()` in an output mapping:

```feel
= context put(toolCallResult, "confirmation", sendResult)
```

This works only for elements that run in the workflow engine. Connector result expressions cannot read the current value of `toolCallResult`, so a connector tool must build its complete result in a single expression.

### What the rule cannot see

Results written by arbitrary FEEL expressions elsewhere, such as a variable set by a called process, cannot be detected statically. Ignore the warning or make the result wiring explicit with an output mapping.

Overwrite detection is also skipped for any tool flow that branches, such as at a gateway split, join, or boundary event. This applies even when the branches are guaranteed to converge before the next write. Review these flows manually for potential overwrites.

### The result variable name

This rule always checks for `toolCallResult`, the default used by the AI Agent connector. An AI Agent Task's multi-instance ad-hoc sub-process can rename this variable by changing the multi-instance **Output element** value. If you rename it, ignore the warning for that tool.

---
Source: https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules/agent-tool-output-key
