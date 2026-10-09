# Camunda manual installation — Reference architecture — spring

```yaml
camunda:
  cluster:
    initial-contact-points: [HOST_0:26502, HOST_1:26502, HOST_2:26502]
    size: 3
    node-id: 0 # unique ID of this broker node in a cluster. The ID should be between 0 and number of nodes in the cluster (exclusive).
```

  

#### Configure Connectors authentication

Connectors require authentication to use their full capabilities. By default, the Orchestration Cluster uses Basic authentication. You can configure the cluster to automatically create a user with the necessary permissions at startup.

If you don’t configure a user at startup, create one manually in the Admin UI after deployment.

For more details, see [Admin configuration overview](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/install
