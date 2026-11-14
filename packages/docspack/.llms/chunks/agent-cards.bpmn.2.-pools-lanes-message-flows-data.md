# BPMN agent card — 2. Pools, lanes, message flows, data

```text
# Order fulfilment
[annotation Orders ship within two days]
## Shop | id=shop
### Sales
[start:message Order placed] > [service Check stock] > [send Request payment]
Request payment > [catch Payment received | key=orderId] > [sub Pack order]
Pack order {
  [start Packing started] > [user Pick item | each=items] > [user Box items] > [end Packed]
}
### Warehouse
Pack order > [user Ship order] > [end Order shipped]
Check stock ..> [store Stock DB]
Ship order ..> [object Packing slip]
[annotation Fragile items get extra padding] ..> Pack order
## Restock | id=restock
[start:condition Stock low | cond=stock < 10] > [service Reorder stock] > [end Stock reordered]
## Bank | blackbox
## Customer | blackbox
Customer ~> Order placed: Order
Request payment ~> Bank: Payment request
Bank ~> Payment received: Payment confirmed
```

- `## Name | id=<process id>` starts a pool with its own process; `## Name | blackbox` a partner pool (id: `id=` or the name kebab-cased).
- `### Lane`: nodes declared after it go in that lane; repeat a header to switch back.
- `a ~> b: label` is a message flow between nodes or pools (ids or names) of different pools. A plain `start` it reaches becomes a message start. A same-name `store` in several pools is one data store.
- `[object Name] ..> task`: the task reads it; `task ..> [store Name]`: it writes it. `objects` marks a collection.
- `[sub Name]`, then `Name {`, its paths (own start and end), `}`: an expanded sub-process. Bodies nest.
- `[annotation Text]`: on the collaboration before the first `##`; `[annotation Text] ..> task` links it. Ids are global across pools.

---
Source: https://bpmnkit.com/docs/agent-cards/bpmn
