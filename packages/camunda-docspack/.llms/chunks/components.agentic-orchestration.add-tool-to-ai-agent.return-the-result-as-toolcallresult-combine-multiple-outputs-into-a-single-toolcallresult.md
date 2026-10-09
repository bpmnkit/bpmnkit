# Add tools to an AI agent — Return the result as `toolCallResult` — Combine multiple outputs into a single `toolCallResult`

When your tool produces several values that each contribute a field to `toolCallResult`, do not add one output mapping per field targeting `toolCallResult.<field>`:

- Output mappings and result variables containing a period are discouraged. See [output mappings](https://docs.camunda.io/docs/next/components/concepts/variables#output-mappings).
- Mapping to `toolCallResult` directly replaces the entire variable, so several mappings targeting it overwrite each other.

Whether you can add fields to `toolCallResult` one at a time depends on the element type. Use the approach that matches your tool's element type:

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/add-tool-to-ai-agent
