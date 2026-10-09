# Camunda components flow control configuration

Configure flow control to limit write rates and manage exporting backlogs.

When internal requests are processed faster than the rate at which they are exported, backlogs of unexported records can occur. Flow control slows the write rate of new records through both static write limits and optional dynamic throttling, and prevents the stream from building an excessive backlog of records not yet exported.

For user commands, this will show up as increased [backpressure](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/internal-processing#handling-backpressure), observed latency, and reduced throughput. [Internal processing](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/internal-processing) slows down as the stream processor waits longer for processing results to be written.

Write rate limiting applies to all new records, including processing results, user commands, inter-partition messages, and scheduled tasks.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/configure-flow-control/configure-flow-control
