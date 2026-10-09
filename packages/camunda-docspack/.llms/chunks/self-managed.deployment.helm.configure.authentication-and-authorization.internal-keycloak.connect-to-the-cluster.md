# Set up the Helm chart with an in-cluster Keycloak instance — Connect to the cluster

### Local access with port forwarding

After applying this configuration, use the following `kubectl port-forward` commands to access the APIs and UIs from your localhost. Because Keycloak runs as a separate operator-managed service, also port-forward the Keycloak service:

```bash
# Keycloak Operator service
kubectl port-forward svc/keycloak-service 18080:18080

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

Once port forwarding is active, access each component through `http://localhost:<port>`.
For example:

- Web Modeler: `http://localhost:8070`
- Orchestration Cluster: `http://localhost:8080`

Reach Keycloak at `http://keycloak-service:18080/auth` rather than through `localhost`. The configuration above sets the token issuer to `http://keycloak-service:18080/auth/realms/camunda-platform`, so your browser is redirected to that hostname during login and must resolve it to the forwarded port. Map it to the loopback address first:

```bash
echo "127.0.0.1  keycloak-service" | sudo tee -a /etc/hosts
```

Log in with username `demo` and the password you defined under `identity-firstuser-password`.

**Note: Default URLs and port forwarding**
The configuration shown above uses a default `redirectUrl` of `http://localhost:8070` for Web Modeler, which matches the port-forwarding setup. The Keycloak issuer stays on the in-cluster service name and needs the `/etc/hosts` entry above.

If you don't use port forwarding and instead expose components via Ingress or a domain, you **must** update the `redirectUrl` parameters under `global.identity.auth` to match your actual URLs. See [Ingress setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup) for domain-based configuration examples.

### Domain-based access with Ingress

If you're using Ingress to expose components via a domain (instead of port forwarding), update the redirect URLs in your Helm values:

```yaml
global:
  identity:
    auth:
      webModeler:
        redirectUrl: "https://your-domain.com/modeler" # Or https://modeler.your-domain.com
      # Update other component URLs as needed
```

For complete Ingress configuration, see [Ingress setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/internal-keycloak
