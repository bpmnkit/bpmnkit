# Upgrade Camunda 8.9 to 8.10 using Helm — Monitor and validate the upgrade

After triggering the Helm upgrade, monitor the rollout to ensure all pods return to a healthy state.

### Watch pod rollout progress

```bash
kubectl -n <NAMESPACE> get pods -w
```

You should see pods terminating and restarting with updated images.

### Inspect logs (if required)

```bash
kubectl -n <NAMESPACE> logs <POD_NAME> --previous
```

### Validate the upgrade

1. Confirm all pods are healthy and running `8.10.x` images:

   ```bash
   kubectl -n <NAMESPACE> get pods
   kubectl -n <NAMESPACE> get pods -o jsonpath="{range .items[*]}{.metadata.name}{':\t'}{range .spec.containers[*]}{.image}{'\n'}{end}{end}"
   ```

1. Review the `helm upgrade` output for any `[camunda][warning] DEPRECATION` messages. Each one names a key still to migrate before it is removed in a later major chart version.

1. Verify access to Camunda components, authentication and authorization behavior, and that your workers can still poll and complete jobs.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
