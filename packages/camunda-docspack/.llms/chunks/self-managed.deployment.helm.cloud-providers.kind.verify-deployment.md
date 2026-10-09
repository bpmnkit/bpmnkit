# Deploy Camunda 8 to a local kind cluster — Verify deployment

Monitor the deployment progress:

```bash
kubectl get pods -n camunda -w
```

Wait until all pods show `Running` status. This may take 5–10 minutes depending on your internet connection and system resources.

You can also use the deployment readiness check script, run from the reference architecture directory `get-your-copy.sh` left you in. This script requires [jq](https://jqlang.github.io/jq/) to be installed:

```bash
export CAMUNDA_NAMESPACE=camunda
../../../generic/kubernetes/single-region/procedure/check-deployment-ready.sh
```

The script polls the namespace until every pod is `Running` with all of its containers ready. If the deployment stalls, it reports the containers that are not ready, with their restart count, waiting reason, last termination reason, and exit code, together with recent warning events, so you can see what is blocking it.

Configure it with the following environment variables:

| Variable                            | Default   | Purpose                                                          |
| ----------------------------------- | --------- | ---------------------------------------------------------------- |
| `CAMUNDA_NAMESPACE`                 | `camunda` | Namespace to watch                                               |
| `DEPLOYMENT_READY_TIMEOUT_SECONDS`  | `1800`    | Wall-clock budget in seconds. Set it to `0` to wait indefinitely |
| `DEPLOYMENT_READY_INTERVAL_SECONDS` | `5`       | Delay in seconds between two polls                               |

See the check-deployment-ready.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/single-region/procedure/check-deployment-ready.sh
```

Finally, verify the Helm release:

```bash
helm list -n camunda
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
