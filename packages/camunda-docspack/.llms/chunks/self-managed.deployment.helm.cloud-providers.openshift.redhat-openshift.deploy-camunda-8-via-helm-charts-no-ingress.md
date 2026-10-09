# Red Hat OpenShift — Deploy Camunda 8 via Helm charts — no-ingress

If you do not have a domain name or do not intend to use one for your Camunda 8 deployment, external access to Camunda 8 web endpoints from outside the OpenShift cluster will not be possible.

However, you can use `kubectl port-forward` to access Camunda without a domain name or Ingress configuration. For more information, refer to the [kubectl port-forward documentation](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_port-forward/).

To make this work, you will need to configure the deployment to reference `localhost` with the forwarded port. Merge the no-domain overlay into your `values.yml` file:

```bash
yq '. *+ load("generic/openshift/single-region/helm-values/no-domain.yml")' values.yml > values-merged.yml && mv values-merged.yml values.yml
```

Review the no-domain configuration

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/single-region/helm-values/no-domain.yml
```

**Info: Keycloak issuer and localhost hostname alignment**

When running without a domain using the Keycloak Operator, Console validates the JWT issuer claim against the configured Keycloak base URL. To keep token issuance consistent and avoid mismatches, the chart configuration sets Keycloak's hostname to its Kubernetes Service name when operating locally. This means that during port-forwarding you may need to map the service hostname to `127.0.0.1` so that browser redirects and token issuer values align.

Add (or update) the following entry in your `/etc/hosts` file while developing locally:

```text
127.0.0.1  keycloak-service
```

After adding this entry, you can reach Keycloak at:
`http://keycloak-service:18080/auth`

**Why port `18080`?**
The Keycloak Operator deploys the Keycloak service on port `18080`. We forward that port to the same local port (`18080`) to keep the JWT issuer URL consistent and avoid token validation mismatches.

This constraint does not apply when a proper domain and Ingress are configured (the public FQDN is then used as the issuer and no hosts file changes are needed).

**Warning: No-domain deployment**
When running without a domain, you access the platform via `kubectl port-forward`. The IdP issuer URL must be aligned with your port-forward setup. Most external OIDC providers don't allow `localhost` as a redirect URI, so a no-domain deployment generally requires Keycloak deployed in the cluster. If you're using Keycloak via the Keycloak Operator, refer to the [operator-based infrastructure guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#keycloak-deployment) for the no-domain Helm values overlay and host mapping instructions.

  

#### Configuring the Security Context Constraints

Depending on your OpenShift cluster's Security Context Constraints (SCCs) configuration, the deployment process may vary.
By default, OpenShift employs more restrictive SCCs. The Helm chart must assign `null` to the user running all components and dependencies.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
