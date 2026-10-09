# Deploy Camunda 8 to a local kind cluster — No-domain mode deployment {#no-domain-mode-deployment} — Configure your hosts file for Keycloak

The Keycloak operator configures Keycloak with `keycloak-service` as its hostname. The JWT tokens issued by Keycloak use this hostname in the `iss` claim. To ensure your browser can resolve this hostname during the OIDC login flow, add the following entry to your `/etc/hosts` file:

```text
127.0.0.1  keycloak-service
```

Alternatively, you can run `make hosts.add-keycloak` to add this entry automatically.

After adding this entry and deploying Camunda 8 in the next step, you'll be able to reach Keycloak at `http://keycloak-service:18080/auth`.

**Why port `18080`?** The Keycloak instance is configured to listen on port `18080` (via `httpPort` in the operator CR) to avoid conflicts with the Zeebe Gateway HTTP endpoint, which uses port `8080` locally.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
