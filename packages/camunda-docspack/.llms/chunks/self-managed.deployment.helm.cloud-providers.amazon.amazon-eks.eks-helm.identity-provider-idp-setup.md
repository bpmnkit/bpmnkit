# Install Camunda 8 on an EKS cluster — Identity Provider (IdP) setup

An OIDC-compatible identity provider (IdP) is required. This reference architecture does **not** include an IdP. You must configure your own before proceeding. Options include:

- **Keycloak via the Keycloak Operator**: See the [operator-based infrastructure guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#keycloak-deployment) for installation steps and the corresponding Helm values overlay.
- **External OIDC provider**: See [Connect to an OIDC provider](https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-oidc-provider) for configuration details.

After deploying your IdP, merge the corresponding auth overlay into your `values.yml` using `yq` **before** running `envsubst`:

**Keycloak Operator overlays:**

```bash
# Merge the Keycloak Operator Helm values
# Without a domain, use camunda-keycloak-no-domain-values.yml instead of camunda-keycloak-domain-values.yml
yq ". *+ load(\"camunda-keycloak-domain-values.yml\")" values.yml > values-merged.yml && mv values-merged.yml values.yml

# Merge the identity secrets overlay
yq ". *+ load(\"camunda-values-identity-secrets.yml\")" values.yml > values-merged.yml && mv values-merged.yml values.yml
```

The overlay files are available in the [Keycloak operator-based directory](https://github.com/camunda/camunda-deployment-references/tree/main/generic/kubernetes/operator-based/keycloak). The identity secrets are created automatically by the Keycloak Operator.

**Warning: No-domain deployments and IdP choice**
If you deploy Camunda **without a domain** (using `kubectl port-forward`), you reach Camunda through `localhost`, so your IdP must accept `localhost` redirect URIs. Keycloak, when deployed locally in the cluster, can be configured to accept localhost-based redirect URIs. If you use an external OIDC provider, check its redirect URI rules first.

**Tip: Why isn't an IdP included by default?**
The choice of identity provider is highly specific to each organization's security requirements, existing infrastructure, and compliance needs. Rather than bundling a default IdP that may not match your setup, the reference architecture leaves this choice to you.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm
