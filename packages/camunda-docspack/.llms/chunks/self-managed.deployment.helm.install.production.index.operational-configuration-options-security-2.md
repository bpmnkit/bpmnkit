# Install Camunda for production with Helm — Operational configuration options — Security (2)

Restrict each rule to the specific workloads involved rather than allowing unrestricted namespace traffic.

**Note**
Service ports can differ from the internal component ports listed above, depending on your release name and values. Confirm the ports your installation actually exposes against the rendered chart with `helm template`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
