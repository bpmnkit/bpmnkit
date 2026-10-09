# Migrate to zone-aware brokers — Verify the migration

After you migrate every zone and remove the numbered brokers from every release, query the cluster topology through the management API:

```bash
curl --fail "$MANAGEMENT_URL/actuator/cluster"
```

Confirm that:

- The `partitioning` object in the response reports `"scheme": "ZONE_AWARE"` and lists every zone.
- Every zone-aware broker, such as `zone-a_0` and `zone-b_0`, is `ACTIVE` and hosts the expected partitions.
- No numbered broker is listed.
- Every zone-aware broker [reports healthy](#check-broker-health).
- No numbered StatefulSet or pod remains in any release, for example with `kubectl get statefulsets,pods --namespace "$NAMESPACE"`.

Don't delete the numbered PVCs until you have confirmed these checks. Then delete them explicitly according to your storage-retention policy.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration
