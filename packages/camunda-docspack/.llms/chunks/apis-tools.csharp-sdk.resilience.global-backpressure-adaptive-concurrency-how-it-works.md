# Resilience — Global Backpressure (Adaptive Concurrency) — How It Works

1. Normal state starts with the concurrency cap from `CAMUNDA_SDK_BACKPRESSURE_INITIAL_MAX` (default 16).
2. On backpressure signals the manager reduces available permits using the soft factor (70% by default).
3. Repeated consecutive signals escalate severity to `severe`, applying a stronger reduction factor (50%).
4. Successful (non-backpressure) completions trigger passive recovery checks that gradually restore permits over time if the system stays quiet.
5. Quiet periods (no signals for a configurable decay interval) downgrade severity and reset the consecutive counter.

The policy is intentionally conservative: it only engages after genuine pressure signals and recovers gradually to avoid oscillation.

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/resilience
