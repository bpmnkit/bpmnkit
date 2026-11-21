# bpmnkit CLI — Generate BPMN files

`bpmnkit generate bpmn` creates BPMN files from the command line — no interactive menu required.
Choose a built-in template, supply a full CompactDiagram JSON definition, or patch an existing file.

```sh
bpmnkit generate bpmn --template approval --process-id leave-request
bpmnkit generate bpmn --input order.bpmn --dump-compact   # inspect as JSON for AI
bpmnkit generate bpmn --input order.bpmn --patch '{"elements":[...],"flows":[...]}'
```

`bpmnkit gen types` turns BPMN files into TypeScript types for job workers — job types, their
variables, output and headers, message names and error codes — and can check that every job type has
a worker:

```sh
bpmnkit gen types processes/ --out src/generated/bpmn-types.ts
bpmnkit gen types processes/ --check-workers "src/**/*.ts" --strict
```

See [bpmnkit generate](/docs/cli/generate) for full documentation.

---
Source: https://bpmnkit.com/docs/cli/casen
