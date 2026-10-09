# Red Hat OpenShift — Deploy Camunda 8 via Helm charts — openshift-routes (3)

To configure the orchestration cluster securely, it's essential to set up a secure communication configuration between pods:

- We enable gRPC Ingress for the Zeebe Pod, which sets up a secure proxy that we'll use to communicate with the Zeebe cluster. To avoid conflicts with other services, we use a specific domain (`zeebe-$CAMUNDA_DOMAIN`) for the gRPC proxy, different from the one used by other services (`$CAMUNDA_DOMAIN`). We also note that the port used for gRPC is `443`.
- We mount the **Service Certificate Secret** (`camunda-platform-internal-service-certificate`) to the Zeebe pod and configure a secure TLS connection.

Merge the orchestration route overlay into your `values.yml` file:

```bash
yq '. *+ load("generic/openshift/single-region/helm-values/orchestration-route.yml")' values.yml > values-merged.yml && mv values-merged.yml values.yml
```

   
   Review the orchestration route configuration

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/single-region/helm-values/orchestration-route.yml
```

   

The actual configuration properties can be reviewed [in the Zeebe Gateway configuration documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway).

1. **Connectors:** merge the connectors route overlay:

   ```bash
   yq '. *+ load("generic/openshift/single-region/helm-values/connectors-route.yml")' values.yml > values-merged.yml && mv values-merged.yml values.yml
   ```

   
   Review the connectors route configuration

   ```yaml reference
   https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/single-region/helm-values/connectors-route.yml
   ```

   

   The actual configuration properties can be reviewed [in the connectors configuration documentation](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration#zeebe-broker-connection).

1. **TLS for internal applications:** Configure all other applications running inside the cluster and connecting to the Zeebe Gateway to also use TLS.

1. **Domain configuration:** Set up the global configuration to enable the single Ingress definition with the host. Merge the domain overlay:

   ```bash
   yq '. *+ load("generic/openshift/single-region/helm-values/domain.yml")' values.yml > values-merged.yml && mv values-merged.yml values.yml
   ```

   
   Review the domain configuration

   ```yaml reference
   https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/single-region/helm-values/domain.yml
   ```

   

<!--Intended space left for not breaking the build!-->

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
