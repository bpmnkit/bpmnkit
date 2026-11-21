# bpmnkit generate

`bpmnkit generate bpmn` produces BPMN 2.0 files without the interactive TUI. It has three operating
modes: template, definition (full JSON), and modify-existing (patch). Auto-layout is applied in all modes.


## Commands

```
bpmnkit generate          (alias: bpmnkit gen)
├── bpmn    — generate or modify a BPMN file
└── types   — generate TypeScript types from BPMN; check workers against it
```


## Template mode

Pick a built-in template by name. Use `--process-id` and `--name` to customise the identifiers.

```sh
bpmnkit generate bpmn --template minimal --process-id order --name "Order Processing"
bpmnkit generate bpmn --template approval --process-id leave-request
bpmnkit generate bpmn --template parallel --process-id enrichment --name Enrichment
bpmnkit generate bpmn --template timer-start --process-id nightly-sync
```

| Template | Pattern |
|---|---|
| `empty` | Start event only — bare skeleton |
| `minimal` | Start → service task → end |
| `user-task` | Start → user task → end |
| `call-activity` | Start → call activity → end |
| `business-rule` | Start → business rule task → end |
| `approval` | Start → user task → XOR gateway → approve/reject paths |
| `parallel` | Start → parallel fork → 2 service tasks → join → end |
| `inclusive` | Start → inclusive gateway → 2 conditional tasks → merge → end |
| `timer-start` | Timer start event → service task → end |
| `message-start` | Message start event → service task → end |
| `error-boundary` | Service task with error boundary → two end events |
| `subprocess` | Start → embedded sub-process → end |
| `event-subprocess` | Process with a non-interrupting error event sub-process |

### Flags

| Flag | Short | Description | Default |
|---|---|---|---|
| `--template` | | Template name (see table above) | `minimal` |
| `--process-id` | `-i` | Process element ID | `process` |
| `--name` | `-n` | Process display name | — |
| `--output` | `-o` | Output file path (`-` for stdout) | `<process-id>.bpmn` |

---
Source: https://bpmnkit.com/docs/cli/generate
