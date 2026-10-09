# Connect Camunda to any OIDC provider — Create secrets

Create a secret in your Kubernetes namespace that contains all OIDC client secrets:

```bash
kubectl create secret generic oidc-credentials \
  --from-literal=identity-client-secret="<identity-client-secret>" \
  --from-literal=orchestration-client-secret="<orchestration-client-secret>" \
  --from-literal=optimize-client-secret="<optimize-client-secret>" \
  --from-literal=webmodeler-api-client-secret="<web-modeler-api-client-secret>"
```

**Info**
The secret key `webmodeler-api-client-secret` is not used elsewhere in this guide. This client is intended for your own use if you want to access the [Web Modeler API](https://docs.camunda.io/docs/next/apis-tools/web-modeler-api/authentication) programmatically.

The PostgreSQL credentials for Management Identity and Camunda Hub are no longer created here. They are provided by the operator (or managed database) that hosts each database, such as the `pg-identity-secret` and `pg-hub-secret` created by the [CloudNativePG operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#postgresql-deployment).
**Tip: Alternative secret management**
For production deployments, consider using external secret management solutions. See [External Kubernetes secrets](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management#method-2-external-kubernetes-secrets-recommended) for more options.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
