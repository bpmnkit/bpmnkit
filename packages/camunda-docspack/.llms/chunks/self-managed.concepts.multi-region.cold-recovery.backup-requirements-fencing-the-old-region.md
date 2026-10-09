# Cold Recovery — Backup requirements — Fencing the old region

If the region is truly gone, nothing is running there and no fencing is needed. The problem is when the region only _looks_ gone — a **network partition** means you cannot reach it, but the Orchestration Cluster, job workers, and connectors are still running inside it.

If you start the restored cluster without first stopping the old one, you will have **two clusters that both think they own the same process instances**. Each one can run the same action twice, such as sending the same payment, email, or API call a second time.

Repointing DNS or load balancers does not solve this, as job workers and connectors do not route through the front-door traffic layer - they poll Zeebe and call external systems directly.

Before redirecting traffic, ensure the old region cannot act. Use one or more of the following mechanisms, in order of preference:

- **Stop or scale down the old deployment** if it is reachable (for example, scale Zeebe brokers, gateways, workers, and connector deployments to zero).
- **Revoke the old region's credentials and identity** so it can no longer authenticate to external systems or downstream APIs.
- **Isolate the old region at the network layer** (security groups, firewall rules, or VPC routing) so it cannot reach external systems even if it remains running.

Document and rehearse the specific mechanism you will use as part of your DR drill — fencing is operationally specific to your environment and must be tested before a real incident.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/cold-recovery
