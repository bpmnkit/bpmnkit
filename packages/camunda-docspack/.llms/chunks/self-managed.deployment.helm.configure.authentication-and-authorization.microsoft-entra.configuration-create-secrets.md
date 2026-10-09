# Set up the Helm chart with an external Microsoft Entra tenant — Configuration — Create secrets

Create a secret in your Kubernetes namespace that contains all OIDC client secrets:

```
kubectl create secret generic entra-credentials \
  --from-literal=identity-client-secret="<mgmt-identity-app-secret>" \
  --from-literal=orchestration-cluster-client-secret="<oc-app-secret>" \
  --from-literal=optimize-client-secret="<optimize-application-secret>" \
  --from-literal=webmodeler-api-client-secret="<web-modeler-api-app-secret>"
```

**Info**
In Microsoft Entra, the term _application secret_ is used.
In Camunda configuration, this value is referred to as a _client secret_ to align with OIDC/OAuth standards.

**Info**
The secret key `webmodeler-api-client-secret` is not used elsewhere in this guide. This client is intended for your own use if you want to access the [Web Modeler API](https://docs.camunda.io/docs/next/apis-tools/web-modeler-api/authentication) programmatically.

The PostgreSQL credentials for Management Identity and Camunda Hub are no longer created here. They are provided by the operator (or managed database) that hosts each database, such as the `pg-identity-secret` and `pg-hub-secret` created by the [CloudNativePG operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#postgresql-deployment).

For additional options on how to create and reference Kubernetes secrets (for example using YAML manifests or consolidated secrets), see [External Kubernetes secrets](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management#method-2-external-kubernetes-secrets-recommended).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/microsoft-entra
