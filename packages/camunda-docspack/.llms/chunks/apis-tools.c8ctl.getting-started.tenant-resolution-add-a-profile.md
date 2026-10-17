# c8ctl CLI — Tenant resolution — Add a profile

```bash
# Minimal local profile (defaults to http://localhost:8080/v2)
c8 add profile local

# OAuth-secured cluster
c8 add profile prod \
  --baseUrl=https://camunda.example.com \
  --clientId=your-client-id \
  --clientSecret=your-client-secret

# With explicit OAuth endpoint, audience, and scope
c8 add profile prod \
  --baseUrl=https://camunda.example.com \
  --clientId=your-client-id \
  --clientSecret=your-client-secret \
  --audience=camunda-api \
  --oAuthUrl=https://auth.example.com/oauth/token \
  --scope="my-oauth-scope"

# With a default tenant
c8 add profile dev \
  --baseUrl=https://dev.example.com \
  --clientId=dev-client \
  --clientSecret=dev-secret \
  --defaultTenantId=dev-tenant

# Import settings from a .env file
c8 add profile staging --from-file .env.staging

# Import settings from the current CAMUNDA_* environment variables
source .env.prod
c8 add profile prod --from-env
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started
