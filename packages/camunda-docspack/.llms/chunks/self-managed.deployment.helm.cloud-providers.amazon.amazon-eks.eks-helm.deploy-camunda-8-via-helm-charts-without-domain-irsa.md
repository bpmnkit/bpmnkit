# Install Camunda 8 on an EKS cluster — Deploy Camunda 8 via Helm charts — without-domain-irsa

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region-irsa/helm-values/values-no-domain.yml
```

**Warning: No-domain deployment**
When running without a domain, you access the platform via `kubectl port-forward`. The IdP issuer URL must be aligned with your port-forward setup. Most external OIDC providers don't allow `localhost` as a redirect URI, so a no-domain deployment generally requires Keycloak deployed in the cluster. If you're using Keycloak via the Keycloak Operator, refer to the [operator-based infrastructure guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#keycloak-deployment) for the no-domain Helm values overlay and host mapping instructions.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm
