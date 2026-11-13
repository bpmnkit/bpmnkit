# casen build — Spec formats

| Spec | What it is |
|------|------------|
| `.txt` (any other extension) | The process [line format](/agent-cards/bpmn/) plus `## Pool \| id=…` sections (`\| blackbox` for a partner pool), `### Lane` headers, `a ~> b: label` message flows, `d[object Name] ..> task` / `task ..> d[store Name]` data, and `fields=` on user tasks |
| `.json` | A `CompactDiagram` |
| `.mjs` / `.js` / `.ts` | A module whose default export is a model, a builder, or `(kit, model) => …` returning either; `kit` is `@bpmnkit/core` |

```text
# Order fulfilment
## Shop | id=shop
### Sales
placed[start:message Order placed | msg=order-placed] > ask[send Request payment | job=request-payment]
ask > paid[catch Payment received | msg=payment-received key=orderId] > ship[user Ship order | fields=carrier,tracking]
### Warehouse
ship > done[end Order shipped]
ship ..> slip[object Packing slip]
## Bank | blackbox
ask ~> bank: Payment request
bank ~> paid: Payment confirmed
```

---
Source: https://bpmnkit.com/docs/cli/build
