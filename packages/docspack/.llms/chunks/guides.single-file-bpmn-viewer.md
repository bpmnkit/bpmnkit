# One-File BPMN Viewer

Send a process to someone who has no modeler: one `.html` file, no server, no CDN, no other files.
`@bpmnkit/viewer-lite` is an 8 KB (gzip) script that draws BPMN XML as a pannable, zoomable SVG,
small enough to inline into the page that carries the diagram.



## From the CLI

```sh
casen export html order.bpmn                      # writes order.html next to the file
casen export html order.bpmn -o site/order.html --title "Order process"
```

The file has no layout (no `bpmndi` section)? The page shows a short message instead of a diagram:
lay it out first with `@bpmnkit/core`.

---
Source: https://bpmnkit.com/docs/guides/single-file-bpmn-viewer
