# Internal processing

This document analyzes the state machines, events and commands, stateful stream processing, driving the engine, and handling backpressure within Zeebe.

Internally, Zeebe is implemented as a collection of **stream processors** working on record streams \(partitions\). The stream processing model is used since it is a unified approach to provide:

- Command protocol \(request-response\),
- Record export \(streaming\),
- Process evaluation \(asynchronous background tasks\)

Record export solves the history problem and the stream provides the kind of exhaustive audit log a workflow engine needs to produce.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/internal-processing
