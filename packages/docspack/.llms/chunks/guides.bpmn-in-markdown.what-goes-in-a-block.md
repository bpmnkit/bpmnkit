# BPMN Diagrams in Markdown — What goes in a block

| Fence | Contents |
|---|---|
| ` ```bpmn ` | BPMN 2.0 XML — a whole `.bpmn` file. If it carries diagram interchange (`<bpmndi:BPMNDiagram>`), that layout is drawn as it is; if the DI is missing or incomplete, the diagram is laid out automatically. |
| ` ```bpmn-compact ` | The [compact JSON format](/docs/getting-started/concepts) that `compactify()` produces and language models write. A single process can skip the `{ "id", "processes": [...] }` wrapper, as above. Always laid out automatically. |
| ` ```bpmn-json ` | An alias of `bpmn-compact`. |
| ` ```bpmnkit-text ` | BPMN Kit Text, the line format `parseProcessText` reads. |

A ` ```bpmnkit-text ` block holds [BPMN Kit Text](/docs/guides/process-text), the line format a
language model writes. It is a shorter way to write the same diagram. A block the parser could not
read in full is reported as an error instead of drawn in part. The
[element reference](/docs/guides/process-text-reference) is made of such blocks.

````md
```bpmnkit-text
# Order check
start[start Order received] > check[service Check stock | job=check-stock] > done[end Shipped]
```
````

```bpmnkit-text
# Order check
start[start Order received] > check[service Check stock | job=check-stock] > done[end Shipped]
```

One fence attribute is read: `title="…"` sets the diagram's accessible name. Without it the
name is the process's `name`, then the first pool's, then the process id.

---
Source: https://bpmnkit.com/docs/guides/bpmn-in-markdown
