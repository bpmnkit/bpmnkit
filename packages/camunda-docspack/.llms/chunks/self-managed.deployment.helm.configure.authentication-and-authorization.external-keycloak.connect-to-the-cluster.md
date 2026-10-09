# Set up the Helm chart with an external Keycloak instance — Connect to the cluster

After applying this configuration, use the following `kubectl port-forward` commands to access the APIs and UIs from your localhost:

```bash
# Management Identity
kubectl port-forward svc/camunda-identity 8084:80

# Orchestration Cluster
kubectl port-forward svc/camunda-zeebe-gateway 8080:8080
kubectl port-forward svc/camunda-zeebe-gateway 26500:26500

# Connectors
kubectl port-forward svc/camunda-connectors 8086:8080

# Optimize
kubectl port-forward svc/camunda-optimize 8083:80

# Web Modeler
kubectl port-forward svc/camunda-web-modeler-restapi 8070:80
kubectl port-forward svc/camunda-web-modeler-websockets 8085:80

# Console
kubectl port-forward svc/camunda-console 8087:80
```

After port forwarding, access the UIs through `http://localhost:<port>`.

For example:

- Orchestration Cluster UI: `http://localhost:8080`
- Management Identity: `http://localhost:8084`

Log in with the username `demo` and the password stored in the secret key `identity-firstuser-password`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak
