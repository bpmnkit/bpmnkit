# Multi-Region RDBMS — Architecture — The database tier is active-standby

The Zeebe data plane is active-active: every region processes. The database tier is not. A single writer serves every region, and brokers that are not co-located with it pay the inter-region round trip on every export flush.

Two consequences follow, and both are sizing decisions rather than configuration:

- Keep regions inside the round-trip time budget described in [network requirements](#network-requirements).
- Size the exporter queue for the latency of the furthest region, not the nearest.

Skewing partition leadership to the writer's zone through zone priority reduces how often that round trip is paid, but it does not remove it.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms
