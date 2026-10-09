# Helm chart dual-region operational procedure — Procedure — redistribute-to-even

```bash
curl -XPATCH 'http://localhost:9600/actuator/cluster?force=true' \
  -H 'Content-Type: application/json' \
  -d '{
    "brokers": {
      "remove": [1,3,5,7]
      }
    }'
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
