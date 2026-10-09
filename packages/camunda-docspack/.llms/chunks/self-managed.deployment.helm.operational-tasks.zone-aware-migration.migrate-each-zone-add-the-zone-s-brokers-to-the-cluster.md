# Migrate to zone-aware brokers — Migrate each zone — Add the zone's brokers to the cluster

Use the [zone migration endpoint](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#migrate-a-zone-to-a-zone-aware-topology) to add the zone's zone-aware brokers to the cluster. The new brokers take over the partitions of the zone's numbered brokers, and the numbered brokers leave the cluster. Before you send the request, [check that every broker in the logical cluster is healthy](#check-broker-health). A partition that can't start blocks the migration, and the change stays `IN_PROGRESS`.

Set `LOCAL_ZONE` to the zone to migrate:

```bash
curl --fail --request PUT \
  "$MANAGEMENT_URL/actuator/cluster/zones" \
  --header 'Content-Type: application/json' \
  --data "{\"zone\":\"$LOCAL_ZONE\"}"
```

The response includes a `changeId`. [Monitor the change](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#monitor-a-configuration-change) until it completes.

After the change completes, use [`GET /actuator/cluster` in the Cluster API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#cluster-api) to check the topology:

```bash
curl --fail "$MANAGEMENT_URL/actuator/cluster"
```

In the response, confirm that:

- The zone-aware brokers of the migrated zone, with IDs such as `zone-a_0`, are listed with `"state": "ACTIVE"` and host the expected partitions.
- The numbered brokers of the migrated zone, with numeric IDs such as `0`, are no longer listed.
- The zone-aware brokers of the migrated zone [report healthy](#check-broker-health).

Leave `keepUnzonedBrokers: true` if the zone migration is incomplete. Don't remove the numbered Kubernetes resources while a numbered broker of the zone still owns a partition or remains in cluster membership.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration
