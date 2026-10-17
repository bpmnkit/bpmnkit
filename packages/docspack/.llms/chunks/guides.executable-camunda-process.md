# Build an Executable Camunda Process

Each section below answers one question you hit while writing a build script for a process
that Camunda 8.10 has to run, not only draw. The snippets are cut from one reference script,
`packages/core/tests/fixtures/bakeoff/build.ts` in the repository, which builds a chat agent
with tools end to end. Run its output through the last section before you test anything.

Every snippet assumes this setup:

```typescript
import { Bpmn } from "@bpmnkit/core"
import { applyTemplates } from "@bpmnkit/core/connectors"

const model = Bpmn.createProcess("ai-agent-chat-with-tools")
	.name("AI Agent Chat With Tools")
	.executable(true)
	.executionPlatformVersion("8.10.0")
```

---
Source: https://bpmnkit.com/docs/guides/executable-camunda-process
