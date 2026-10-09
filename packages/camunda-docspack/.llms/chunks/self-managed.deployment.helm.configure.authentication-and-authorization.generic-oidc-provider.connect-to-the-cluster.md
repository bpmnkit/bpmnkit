# Connect Camunda to any OIDC provider — Connect to the cluster

After deploying Camunda with this configuration, use the following `kubectl port-forward` commands to access the APIs and UIs:

```bash
# Management Identity
kubectl port-forward svc/camunda-identity 8084:80

# Orchestration Cluster (Operate/Tasklist)
kubectl port-forward svc/camunda-zeebe-gateway 8080:8080

# Zeebe Gateway (gRPC for clients)
kubectl port-forward svc/camunda-zeebe-gateway 26500:26500

# Optimize
kubectl port-forward svc/camunda-optimize 8083:80

# Web Modeler
kubectl port-forward svc/camunda-web-modeler-restapi 8070:80
kubectl port-forward svc/camunda-web-modeler-websockets 8085:80

# Console
kubectl port-forward svc/camunda-console 8087:80
```

Once port forwarding is active, access each component through `http://localhost:<port>`.
For example, Management Identity at `http://localhost:8084` or the Orchestration Cluster at `http://localhost:8080` (which redirects to your OIDC provider for login).

**Important: Redirect URI configuration**
Ensure your redirect URIs in your OIDC provider match how you're accessing Camunda. If you configured redirect URIs for localhost testing (e.g., `http://localhost:8080/sso-callback`), the port-forward commands above will work. If you configured redirect URIs for Ingress (e.g., `https://camunda.example.com/orchestration/sso-callback`), you'll need to access via Ingress instead.

For production deployments, configure Ingress to expose components. See [Ingress configuration](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/index) for more details.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider
