# RDBMS troubleshooting and operations — Slow data export

**Symptom:** Data takes a long time to appear in the database after process events.

**Cause:** Flush interval or queue size not tuned for your workload.

**Diagnosis:**

1. Check current flush interval in logs:

```bash
kubectl logs <pod-name> | grep -i flushinterval
```

2. Verify queue size settings in your Helm values.

**Fix:** Adjust these settings:

```yaml
orchestration:
  extraConfiguration:
    - file: "flush-interval.yaml"
      content: |
        camunda:
          data:
            secondary-storage:
              rdbms:
                flush-interval: PT1S # More frequent flushes
                queue-size: 5000 # Larger queue for buffering
                queue-memory-limit: 50 # Increase if needed
```

- Smaller `flushInterval` → more frequent writes (increases DB load).
- Larger `queueSize` → more events buffered before flush (increases memory).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-troubleshooting
