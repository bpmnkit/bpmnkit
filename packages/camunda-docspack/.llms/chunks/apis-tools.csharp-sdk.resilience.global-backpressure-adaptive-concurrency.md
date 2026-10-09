# Resilience — Global Backpressure (Adaptive Concurrency)

The client includes an adaptive backpressure manager that throttles the number of in-flight operations when the cluster signals resource exhaustion. It complements (not replaces) per-request HTTP retry.

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/resilience
