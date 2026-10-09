# Red Hat OpenShift — Verify connectivity to Camunda 8 — without

This requires port-forwarding the Zeebe Gateway to be able to connect to the cluster.

Desktop Modeler communicates via gRPC, so only port `26500` needs to be forwarded. If you also need REST API access (port `8080`), refer to the [REST API section above](#use-the-token).

```shell
kubectl port-forward "services/$CAMUNDA_RELEASE_NAME-zeebe-gateway" 26500:26500 --namespace "$CAMUNDA_NAMESPACE"
```

The following values are required for OAuth authentication:

- **Cluster endpoint:** `http://localhost:26500`
- **Client ID:** Retrieve the client ID value from the identity page of your created M2M application
- **Client Secret:** Retrieve the client secret value from the Identity page of your created M2M application
- **OAuth Token URL:** Your IdP's token endpoint (for example, `http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token` when using Keycloak with port-forwarding)
- **Audience:** `orchestration-api`, the default for Camunda 8 Self-Managed

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
