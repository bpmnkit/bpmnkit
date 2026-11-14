# One-File BPMN Viewer — From Node

```typescript
import { readFileSync, writeFileSync } from "node:fs"
import { toHtml } from "@bpmnkit/viewer-lite/html"

writeFileSync("order.html", toHtml(readFileSync("order.bpmn", "utf8"), { title: "Order process" }))
```

`toHtml(xml, { title?, theme?, colors? })` returns the page as a string. The XML sits inside
`<script type="application/bpmn+xml">`, where an HTML parser ends the element at the first
`</script`. `toHtml` hides it without changing what the XML parses to: in text it is already
`&lt;/script`, in CDATA the section is split and rejoined, in a comment it is escaped. XML with a real
`<script>` element cannot be inlined, and `toHtml` throws.

---
Source: https://bpmnkit.com/docs/guides/single-file-bpmn-viewer
