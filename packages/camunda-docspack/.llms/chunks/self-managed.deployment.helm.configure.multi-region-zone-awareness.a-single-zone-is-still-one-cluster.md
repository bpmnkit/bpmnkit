# Configure zone-aware multi-region deployments — A single zone is still one cluster

Zone awareness with one zone gives brokers named identities. It cannot bias leaders between failure domains, because every replica has the same zone priority. The chart treats one zone as one cluster, and it generates the initial contact points for you. A second zone spreads the deployment and lets different priorities influence leader placement.

**Note**
Adding a zone that was not part of the original zone list is not a Helm-only change. The partition distribution has to be updated through the [cluster management API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#add-or-re-add-a-zone) as well, because existing partitions have to be told about the new zone.

To add a zone, start the brokers in the new zone first. Then update the configuration and add the zone through the [Add a zone API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#add-or-re-add-a-zone). Do not declare a zone before its brokers run, because every partition then runs one zone short.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/multi-region-zone-awareness
