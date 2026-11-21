# bpmnkit view — Tabbed navigation

When multiple files are loaded, the viewer renders a tab bar at the top. Click a tab to switch
diagrams. Tabs show the filename and are colour-coded by type (BPMN / DMN / Form).


## Stopping the server

Press `Ctrl+C` in the terminal where `bpmnkit view` is running. The server shuts down cleanly.


## Usage in an AI workflow

```sh
# Generate a process, then immediately view it
bpmnkit generate bpmn --template approval --process-id approve
bpmnkit view bpmn approve.bpmn

# Inspect a folder of processes together
bpmnkit view open ./processes/

# After patching an existing file, verify the result
bpmnkit generate bpmn --input order.bpmn --patch '...'
bpmnkit view bpmn order.bpmn --no-open --port 3044
```

---
Source: https://bpmnkit.com/docs/cli/view
