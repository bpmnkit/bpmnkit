---
"@bpmnkit/cli": minor
"@bpmnkit/viewer-lite": minor
---

`casen export html <file.bpmn> [-o out.html]` writes one self-contained HTML page that shows the diagram. `@bpmnkit/viewer-lite/html` exports `toHtml(xml, { title? })` for the same from Node, escaping `</script` in the XML safely.
