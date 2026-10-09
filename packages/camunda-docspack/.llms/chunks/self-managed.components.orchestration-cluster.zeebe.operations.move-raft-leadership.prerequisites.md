# Move Raft leadership between zones — Prerequisites

Before moving leadership, confirm the following conditions:

- The cluster is fully [zone-aware](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/zone-aware-clusters).
- All brokers and partitions are healthy.
- The target zone's replicas are caught up with the current leaders.
- You can access the Zeebe Gateway [Management API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api) on its management port. The default port is `9600`.
- You have identified a low-load maintenance window. Rebalancing can cause temporary unavailability while partition leaders are re-elected.

The management port is typically not publicly exposed. Its access and TLS configuration are separate from the v2 REST API. If the gateway isn't reachable from the machine where you run these commands, use a private connection such as `kubectl port-forward svc/camunda-zeebe-gateway 9600:9600`, then use `localhost` for `{zeebe-gateway}`. For Amazon ECS deployments, use AWS Systems Manager port forwarding through ECS Exec, an SSH tunnel through a bastion host, or another private network path to reach port `9600`. You can also execute the commands from a broker task or pod that can reach the gateway. The examples use `http://` for a management endpoint without TLS. If your management endpoint uses TLS, use `https://` and the appropriate `curl` TLS options.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/move-raft-leadership
