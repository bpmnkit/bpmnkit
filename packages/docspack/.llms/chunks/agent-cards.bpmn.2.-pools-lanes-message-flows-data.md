# BPMN agent card — 2. Pools, lanes, message flows, data

```text
# Order fulfilment
policy[annotation Orders ship within two days]
## Shop | id=shop
### Sales
placed[start:message Order placed | msg=order-placed] > check[service Check stock | job=check-stock] > ask[send Request payment | job=request-payment]
ask > paid[catch Payment received | msg=payment-received key=orderId] > pack[sub Pack order]
pack {
  ps[start Packing started] > pick[user Pick item | each=items] > box[user Box items] > pe[end Packed]
}
### Warehouse
pack > ship[user Ship order] > done[end Order shipped]
check ..> stock[store Stock DB]
ship ..> slip[object Packing slip]
fragile[annotation Fragile items get extra padding] ..> pack
## Restock | id=restock
low[start:condition Stock low | cond=stock < 10] > reorder[service Reorder stock | job=reorder] > reordered[end Stock reordered]
## Bank | blackbox
## Customer | blackbox
customer ~> placed: Order
ask ~> bank: Payment request
bank ~> paid: Payment confirmed
```

- `## Name | id=<process id>` starts a pool with its own process; `## Name | blackbox` a partner pool without one (its id: `id=` or the name in lower case).
- `### Lane`: nodes declared after it go in that lane; repeat a header to switch back. Gateways and events the reader adds follow their neighbours.
- `a ~> b: label` is a message flow; `a` and `b` are node ids or pool ids, in different pools.
- `d[object Name] ..> task`: the task reads it; `task ..> d[store Name]`: the task writes it. `objects` marks a collection.
- `sp[sub Name]`, then `sp {`, its paths (own start and end), `}`: an expanded sub-process. Bodies nest.
- `n[annotation Text]`: a text annotation, on the collaboration when written before the first `##`; `n[annotation Text] ..> task` links it.
- Ids are global: give every node a unique id across pools.

---
Source: https://bpmnkit.com/docs/agent-cards/bpmn
