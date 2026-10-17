# Conceptual differences — Architectural differences — No embedded engine in Camunda 8

Camunda 7 allows embedding the workflow engine as a library in your application. This means both run in the same JVM, share thread pools, and can even use the same data source and transaction manager.

In contrast, **the workflow engine** in Camunda 8, Zeebe, is always **a remote resource** for your application, while the embedded engine mode is not supported.

If you are interested in the reasons **why** we switched our recommendation from embedded to remote workflow engines, refer to the blog post on [moving from embedded to remote workflow engines](https://blog.bernd-ruecker.com/moving-from-embedded-to-remote-workflow-engines-8472992cc371).

The implications for your process solution and the programming model are described below. Conceptually, the only big difference is that with a remote engine, **you cannot share technical [ACID transactions](https://en.wikipedia.org/wiki/ACID)** between your code and the workflow engine. You can read more about it in the blog post on [achieving consistency without transaction managers](https://blog.bernd-ruecker.com/achieving-consistency-without-transaction-managers-7cb480bd08c).

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/conceptual-differences
