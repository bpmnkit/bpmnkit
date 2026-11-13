# casen build — Spec formats

| Spec | What it is |
|------|------------|
| `.txt` (any other extension) | The process [line format](/agent-cards/bpmn/) plus `## Pool \| id=…` sections (`\| blackbox` for a partner pool), `### Lane` headers, `a ~> b: label` message flows, `d[object Name] ..> task` / `task ..> d[store Name]` data, `sp[sub Name]` with an `sp {` … `}` body (expanded sub-process), `n[annotation Text]` (`..> task` links it), `start:condition` / `catch:condition` with `cond=<FEEL>`, and `fields=` on user tasks |
| `.json` | A `CompactDiagram` |
| `.mjs` / `.js` / `.ts` | A module whose default export is a model, a builder, or `(kit, model) => …` returning either; `kit` is `@bpmnkit/core` |

```text
# Order fulfilment
## Shop | id=shop
### Sales
placed[start:message Order placed | msg=order-placed] > ask[send Request payment | job=request-payment]
ask > paid[catch Payment received | msg=payment-received key=orderId] > pack
### Warehouse
ship[user Ship order | fields=carrier,tracking] > done[end Order shipped]
ship ..> slip[object Packing slip]
pack[sub Pack order] > ship
pack {
  ps[start Packing started] > pick[user Pick item | each=items] > pe[end Packed]
}
note[annotation Fragile items get extra padding] ..> pack
## Bank | blackbox
ask ~> bank: Payment request
bank ~> paid: Payment confirmed
```

A timer start takes only a literal date (`at=2026-01-31T09:00:00Z`). What the text spec cannot
express (event sub-processes, transactions, compensation, groups) is reported in one line that
points to a builder module. A module's model gets the same completions as a text spec: a gateway
that both joins and splits gets a merge gateway in front, and a message that is only thrown keeps
its `messageRef`: it shares the caught message of the same name, or takes the correlation key the
process waits with, so camunda-compat's `subscription` rule stays clean.

A plain `start` that a message flow reaches becomes a message start; a `store` with the same name in
several pools is one `bpmn:dataStore`; a rule task calls `decision=<id>`, else its name kebab-cased.
In the layout, black-box pools go to the top or bottom when that costs the messages nothing,
message flows carry their label in the band between pools, and an event's name moves above a
message flow that docks under it.

---
Source: https://bpmnkit.com/docs/cli/build
