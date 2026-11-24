# Wasm Job Workers

A Wasm worker is a Rust function that handles one or more Camunda 8 job types. It is compiled to a
`wasm32-wasip2` component and run by `bpmnkit-wasm-host`, which talks to the cluster over the REST
API. The component cannot touch the host beyond what its manifest grants: no files, no environment,
no sockets, and HTTP only to the hosts it lists.

The manifest is the security boundary, not the Rust. A worker written by a model or a stranger is
run with the same limits as one you reviewed: memory, time, outbound hosts and secret names are
enforced by the build and again by the host.

---
Source: https://bpmnkit.com/docs/guides/wasm-workers
