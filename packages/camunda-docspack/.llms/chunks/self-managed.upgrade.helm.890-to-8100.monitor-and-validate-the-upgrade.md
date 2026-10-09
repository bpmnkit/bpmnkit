# Upgrade Camunda 8.9 to 8.10 using Helm — Monitor and validate the upgrade

After you trigger the Helm upgrade, monitor the rollout to check that all pods return to a healthy state.

### Watch pod rollout progress

```bash
kubectl -n <NAMESPACE> get pods -w
```

You should see pods terminate and restart with updated images.

### Inspect logs (if required)

```bash
kubectl -n <NAMESPACE> logs <POD_NAME> --previous
```

### Monitor migration progress

There are two ways to monitor the migration status of the Orchestration Cluster:

#### Public Cluster API

The public Cluster API endpoint for [upgrade readiness](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-cluster-upgrade-status.api), `/cluster/v2/status/upgrade`, returns the overall upgrade-readiness status.

```json
{
  "status": "MIGRATED"
}
```

#### Management API

The [Management API endpoint for upgrade readiness](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#upgrade-readiness-api) returns more detail about the overall upgrade status, including details for each physical tenant and condition.

### Validate the upgrade

1. Check that all pods are healthy and run `8.10.x` images:

   ```bash
   kubectl -n <NAMESPACE> get pods
   kubectl -n <NAMESPACE> get pods -o jsonpath="{range .items[*]}{.metadata.name}{':\t'}{range .spec.containers[*]}{.image}{'\n'}{end}{end}"
   ```

1. Check the `helm upgrade` output for `[camunda][warning] DEPRECATION` messages. Each message names a deprecated key and tells you where to move it or that you can remove it. Most messages also state when the chart removes the key (chart v16, Camunda 8.11). Helm prints these messages with the release notes, so `--hide-notes` and `global.createReleaseInfo: false` hide them. The chart also writes them to the `<RELEASE>-warnings` ConfigMap.

1. Check access to Camunda components. Check authentication and authorization behavior. Check that your workers can still poll and complete jobs.

1. In Camunda Hub, click **Environments** in the left navigation, and confirm that the expected environments appear with the correct status. Assign environments to any workspace that you create after the upgrade. See [environments](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100#environments).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
