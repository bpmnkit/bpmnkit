# Configure Docker Compose environments — Enable multi-tenancy

[Multi-tenancy](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy) requires an authenticated API. How you enable it depends on the configuration you run.

### Lightweight configuration

Create a `docker-compose.override.yaml` next to the compose file that protects the API and switches on the tenancy checks:

```yaml
services:
  orchestration:
    environment:
      CAMUNDA_SECURITY_AUTHENTICATION_UNPROTECTEDAPI: "false"
      CAMUNDA_SECURITY_MULTITENANCY_CHECKSENABLED: "true"
      CAMUNDA_SECURITY_MULTITENANCY_APIENABLED: "true"
  connectors:
    environment:
      CAMUNDA_CLIENT_AUTH_METHOD: basic
      CAMUNDA_CLIENT_AUTH_USERNAME: demo
      CAMUNDA_CLIENT_AUTH_PASSWORD: demo
```

Start the stack with `docker compose up -d` and manage tenants through the [Orchestration Cluster API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-tenant.api) or the Orchestration Cluster Admin UI at [http://localhost:8080/admin](http://localhost:8080/admin):

```bash
# Create a tenant
curl -u demo:demo -X POST http://localhost:8080/v2/tenants \
  -H 'Content-Type: application/json' -d '{"tenantId": "tenant-a", "name": "Tenant A"}'
# Assign the demo user to it
curl -u demo:demo -X PUT http://localhost:8080/v2/tenants/tenant-a/users/demo
```

With the API protected, clients must authenticate with Basic authentication (`camunda.client.auth.method=basic` plus username and password in the Camunda client SDKs).

### Full configuration

The full configuration already protects the API through Keycloak, so only the tenancy checks need to be switched on. Add the following to `.env`:

```bash
CAMUNDA_SECURITY_MULTITENANCY_CHECKSENABLED=true
CAMUNDA_SECURITY_MULTITENANCY_APIENABLED=true
```

Start the stack with `docker compose -f docker-compose-full.yaml up -d` and manage tenants through the [Orchestration Cluster API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-tenant.api) with an OAuth token, or the Orchestration Cluster Admin UI at [http://localhost:8080/admin](http://localhost:8080/admin):

```bash
TOKEN=$(curl -s -X POST 'http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token' \
  -d 'grant_type=client_credentials' -d 'client_id=orchestration' -d 'client_secret=secret' | jq -r .access_token)
# Create a tenant
curl -X POST http://localhost:8080/v2/tenants -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"tenantId": "tenant-a", "name": "Tenant A"}'
# Assign the demo user to it
curl -X PUT http://localhost:8080/v2/tenants/tenant-a/users/demo -H "Authorization: Bearer $TOKEN"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/configuration
