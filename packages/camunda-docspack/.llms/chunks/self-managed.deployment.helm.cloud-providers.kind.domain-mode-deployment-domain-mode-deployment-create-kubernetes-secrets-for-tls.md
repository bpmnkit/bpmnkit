# Deploy Camunda 8 to a local kind cluster — Domain mode deployment {#domain-mode-deployment} — Create Kubernetes secrets for TLS

1. Create the TLS secret in Kubernetes. The Ingress controller will use this to serve HTTPS traffic for `camunda.example.com`. This also creates a `camunda-keycloak-tls` secret for the Keycloak Ingress:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/procedure/certs-create-secret.sh
   ```

2. Then, create a ConfigMap with the CA certificate for pods that need to trust it:

   ```bash reference
   https://github.com/camunda/camunda-deployment-references/blob/main/local/kubernetes/kind-single-region/procedure/certs-create-ca-configmap.sh
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
