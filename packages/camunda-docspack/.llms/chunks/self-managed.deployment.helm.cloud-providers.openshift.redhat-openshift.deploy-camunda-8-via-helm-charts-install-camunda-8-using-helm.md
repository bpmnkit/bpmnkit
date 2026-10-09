# Red Hat OpenShift — Deploy Camunda 8 via Helm charts — Install Camunda 8 using Helm

Now that the `generated-values.yml` is ready, you can install Camunda 8 using Helm.

The following are the required environment variables with some example values:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/single-region/procedure/chart-env.sh
```

- `CAMUNDA_NAMESPACE` is the Kubernetes namespace where Camunda will be installed. The script sets it to `camunda`. If you use another namespace, for example the one you exported in [Enable ALPN h2 on ROSA HCP](#enable-alpn-h2-on-rosa-hcp), set that value here, or export it again after you run the script.
- `CAMUNDA_RELEASE_NAME` is the name of the Helm release associated with this Camunda installation.

Then run the following command:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/single-region/procedure/install-chart.sh
```

This command:

- Installs (or upgrades) Camunda using the Helm chart.
- Substitutes the appropriate version using the `$CAMUNDA_HELM_CHART_VERSION` environment variable.
- Applies the configuration from `generated-values.yml`.

**Note**

This guide uses `helm upgrade --install` as it runs install on initial deployment and upgrades future usage. This simplifies future [Camunda 8 Helm upgrades](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/index) or any other component upgrades.

You can track the progress of the installation with the deployment readiness check script, which requires [jq](https://jqlang.github.io/jq/) to be installed.

The script polls the namespace until every pod is `Running` with all of its containers ready. If the deployment stalls, it reports the containers that are not ready, with their restart count, waiting reason, last termination reason, and exit code, together with recent warning events, so you can see what is blocking it.

Download the script and run it:

```bash
curl -fsSL https://raw.githubusercontent.com/camunda/camunda-deployment-references/main/generic/kubernetes/single-region/procedure/check-deployment-ready.sh -o check-deployment-ready.sh
chmod +x check-deployment-ready.sh
./check-deployment-ready.sh
```

Review the script before you run it.

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

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
