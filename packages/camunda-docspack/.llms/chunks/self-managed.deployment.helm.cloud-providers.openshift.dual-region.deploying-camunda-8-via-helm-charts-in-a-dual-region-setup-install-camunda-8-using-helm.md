# Red Hat OpenShift Dual-Region — Deploying Camunda 8 via Helm charts in a dual-region setup — Install Camunda 8 using Helm

With the value files for each region configured, you can now install Camunda 8 using Helm. Execute the following commands:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/install-chart.sh
```

This command:

- Installs (or upgrades) Camunda using the Helm chart on each cluster.
- Substitutes the appropriate version using the `$CAMUNDA_HELM_CHART_VERSION` environment variable.
- Applies the configuration from the value file.

:warning: **Installation is not complete yet:** at this stage, the two Camunda 8 deployments cannot communicate. You need to follow the next step to complete the installation.

**Note**

This guide uses `helm upgrade --install` as it runs install on initial deployment and upgrades future usage. This may make it easier for future [Camunda 8 Helm upgrades](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/index) or any other component upgrades.

#### Export Camunda 8 services using Submariner

Once Camunda is deployed across the two clusters, the next step is to expose each service to Submariner so it can be resolved by the other cluster.

The following script exports all services for both clusters, then waits for the Submariner Lighthouse controller to create `ServiceImport` resources and propagate `*.svc.clusterset.local` DNS records. This wait is critical. Without it, Zeebe brokers may fail to discover cross-cluster peers during startup, leading to topology initialization failures.

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/export-services-submariner.sh
```

**Note**
The DNS propagation timeout defaults to 300 seconds and can be customized via the `DNS_WAIT_TIMEOUT` environment variable.

Alternatively, you can manage each service individually using the `ServiceExport` Custom Resource Definition (CRD). If you do so manually, ensure you wait for the corresponding `ServiceImport` resources to appear before proceeding.

   Example of the ServiceExport manifest

```yaml
apiVersion: multicluster.x-k8s.io/v1alpha1
kind: ServiceExport
metadata:
  name: elasticsearch-es-http # name of the ECK-managed Elasticsearch service to export
  namespace: $CAMUNDA_NAMESPACE_0 # must match the namespace where the Elasticsearch Service exists
```

For each cluster, verify the status of the exported services with this script:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/verify-exported-services.sh
```

To monitor the progress of the installation, save and execute the following script:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/check-deployment-ready.sh
```

Save it as `check-deployment-ready.sh`, make it executable, and run it:

```bash
chmod +x check-deployment-ready.sh
./check-deployment-ready.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region
