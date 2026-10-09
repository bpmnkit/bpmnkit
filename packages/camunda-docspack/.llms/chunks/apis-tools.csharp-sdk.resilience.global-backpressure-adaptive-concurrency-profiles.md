# Resilience — Global Backpressure (Adaptive Concurrency) — Profiles

Profiles supply coordinated defaults. Any explicitly set env var overrides the profile value.

| Profile        | initialMax | softFactor% | severeFactor% | recoveryMs | recoveryStep | quietDecayMs | floor | severeThreshold | Use case                     |
| -------------- | ---------- | ----------- | ------------- | ---------- | ------------ | ------------ | ----- | --------------- | ---------------------------- |
| `BALANCED`     | 16         | 70          | 50            | 1000       | 1            | 2000         | 1     | 3               | General workloads            |
| `CONSERVATIVE` | 12         | 60          | 40            | 1200       | 1            | 2500         | 1     | 2               | Tighter capacity constraints |
| `AGGRESSIVE`   | 24         | 80          | 60            | 800        | 2            | 1500         | 2     | 4               | High throughput scenarios    |
| `LEGACY`       | —          | —           | —             | —          | —            | —            | —     | —               | Observe-only (no gating)     |

Select via environment:

```bash
CAMUNDA_SDK_BACKPRESSURE_PROFILE=AGGRESSIVE
```

Override individual knobs on top of a profile:

```bash
CAMUNDA_SDK_BACKPRESSURE_PROFILE=AGGRESSIVE
CAMUNDA_SDK_BACKPRESSURE_INITIAL_MAX=32
```

The `LEGACY` profile disables adaptive gating entirely — signals are still tracked for observability but no concurrency limits are applied. Use this to opt out of backpressure management while retaining per-request retry.

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/resilience
