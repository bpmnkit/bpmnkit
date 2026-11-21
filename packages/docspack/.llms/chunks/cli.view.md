# bpmnkit view

`bpmnkit view` spawns a local HTTP server and opens the system browser to display BPMN diagrams,
DMN decision tables, and Camunda forms. All rendering happens server-side — no browser plugins required.


## Commands

```
bpmnkit view
├── open    — view any mix of .bpmn, .dmn, and .form files (auto-detects type)
├── bpmn    — view BPMN files rendered as SVG
├── dmn     — view DMN decision tables
└── form    — view Camunda form layouts
```


## Subcommands

### `bpmnkit view open`

Accepts any combination of `.bpmn`, `.dmn`, and `.form` files or directories. File type is
detected automatically from the extension.

```sh
# Mixed file types
bpmnkit view open order.bpmn routing.dmn review.form

# Entire project folder — all supported files get tabs
bpmnkit view open ./project/

# Mix files and folders
bpmnkit view open ./processes/ extra.dmn review.form
```

### `bpmnkit view bpmn`

Renders BPMN diagrams server-side as SVG using `exportSvg` from `@bpmnkit/core`.

```sh
# Single file
bpmnkit view bpmn process.bpmn

# All .bpmn files in a folder
bpmnkit view bpmn ./processes/

# Multiple specific files
bpmnkit view bpmn order.bpmn payment.bpmn shipping.bpmn
```

### `bpmnkit view dmn`

Renders DMN decision tables as ASCII art in a monospace panel.

```sh
bpmnkit view dmn eligibility.dmn
bpmnkit view dmn ./decisions/
```

### `bpmnkit view form`

Renders Camunda form layouts (`.form` files) as ASCII art in a monospace panel.

```sh
bpmnkit view form approval.form
bpmnkit view form ./forms/
```

---
Source: https://bpmnkit.com/docs/cli/view
