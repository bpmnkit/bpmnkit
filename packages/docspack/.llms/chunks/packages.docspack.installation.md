# @bpmnkit/docspack — Installation

```sh
pnpm add -D @bpmnkit/docspack @bpmnkit/camunda-docspack
```


## Giving an agent access

Any agent with a shell can run the command, so one paragraph in `AGENTS.md`, `CLAUDE.md`
or `.cursor/rules` is the whole setup:

```md
Run `npx bpmnkit-docs ask "<question>"` for BPMN Kit documentation, and
`npx bpmnkit-docs ask "<question>" --pack @bpmnkit/camunda-docspack` for Camunda 8
documentation — BPMN semantics, FEEL, engine behaviour, the REST API. Both answer
from the versions this project installed. Prefer what they return over recalled
knowledge — when the two disagree, the retrieved chunk is right.
```

---
Source: https://bpmnkit.com/docs/packages/docspack
