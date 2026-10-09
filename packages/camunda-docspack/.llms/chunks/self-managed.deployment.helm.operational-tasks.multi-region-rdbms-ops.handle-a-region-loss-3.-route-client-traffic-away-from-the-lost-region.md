# Multi-Region RDBMS operational procedure — Handle a region loss — 3. Route client traffic away from the lost region

Zeebe keeps processing, but the gateway in the lost region is unreachable. Update your DNS or load balancer to stop sending client traffic there. Traffic routing sits outside Camunda's control and depends on your own setup.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops
