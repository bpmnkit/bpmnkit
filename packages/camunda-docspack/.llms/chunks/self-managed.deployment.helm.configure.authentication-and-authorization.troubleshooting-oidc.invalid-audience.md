# Troubleshoot OIDC authentication — Invalid audience

**Observed behavior:** Logs show "Invalid token" or "Audience mismatch" errors.

**Why this happens:** The `audience` parameter doesn't match the `aud` claim in tokens.

**How to fix:**

1. Obtain and decode a token:

   ```bash
   curl -X POST '<token-endpoint>' \
     -d 'client_id=<client-id>' \
     -d 'client_secret=<client-secret>' \
     -d 'grant_type=client_credentials' | jq -r '.access_token' | \
     cut -d'.' -f2 | base64 -d | jq '.aud'
   ```

2. Confirm the `aud` value matches the audience you assigned to that component in [Assign a unique audience to each component](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider#assign-a-unique-audience-to-each-component). Update either the Helm value or your provider's client configuration so the two agree.
3. Redeploy Camunda.

**Note**
Some providers, such as Keycloak, may not include the appropriate audience by default. Consult your provider's documentation on configuring token audiences. For Keycloak, see [External Keycloak](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-keycloak).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/troubleshooting-oidc
