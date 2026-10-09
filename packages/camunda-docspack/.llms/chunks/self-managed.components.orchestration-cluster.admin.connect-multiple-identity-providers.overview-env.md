# Connect to multiple identity providers — Overview — env

```
CAMUNDA_SECURITY_AUTHENTICATION_PROVIDERS_OIDC_<provider-id>_CLIENTID=
CAMUNDA_SECURITY_AUTHENTICATION_PROVIDERS_OIDC_<provider-id>_CLIENTNAME=
CAMUNDA_SECURITY_AUTHENTICATION_PROVIDERS_OIDC_<provider-id>_CLIENTSECRET=
CAMUNDA_SECURITY_AUTHENTICATION_PROVIDERS_OIDC_<provider-id>_ISSUERURI=
CAMUNDA_SECURITY_AUTHENTICATION_PROVIDERS_OIDC_<provider-id>_REDIRECTURI=
CAMUNDA_SECURITY_AUTHENTICATION_PROVIDERS_OIDC_<provider-id>_AUTHORIZATIONURI=
CAMUNDA_SECURITY_AUTHENTICATION_PROVIDERS_OIDC_<provider-id>_TOKENURI=
CAMUNDA_SECURITY_AUTHENTICATION_PROVIDERS_OIDC_<provider-id>_JWKSETURI=
CAMUNDA_SECURITY_AUTHENTICATION_PROVIDERS_OIDC_<provider-id>_SCOPE=
CAMUNDA_SECURITY_AUTHENTICATION_PROVIDERS_OIDC_<provider-id>_AUDIENCES=
CAMUNDA_SECURITY_AUTHENTICATION_PROVIDERS_OIDC_<provider-id>_GRANTTYPE=
```

Example configuration for two providers:

```yaml
# Keycloak
camunda.security.authentication.providers.oidc.keycloak.client-name: "Keycloak - MyCompany"
camunda.security.authentication.providers.oidc.keycloak.client-id: <YOUR_KEYCLOAK_CLIENTID>
camunda.security.authentication.providers.oidc.keycloak.client-secret: <YOUR_KEYCLOAK_CLIENTSECRET>
camunda.security.authentication.providers.oidc.keycloak.issuer-uri: "https://<KEYCLOAK_HOST>/realms/<REALM_NAME>"
camunda.security.authentication.providers.oidc.keycloak.redirect-uri: "http://localhost:8080/sso-callback"
camunda.security.authentication.providers.oidc.keycloak.audiences: <YOUR_CLIENTID>
camunda.security.authentication.providers.oidc.keycloak.scope:
  ["openid", "profile", "email"]

# Microsoft EntraID
camunda.security.authentication.providers.oidc.entraid.client-name: "Microsoft EntraID - ContractorCompany"
camunda.security.authentication.providers.oidc.entraid.client-id: <YOUR_ENTRAID_CLIENTID>
camunda.security.authentication.providers.oidc.entraid.client-secret: <YOUR_ENTRAID_CLIENTSECRET>
camunda.security.authentication.providers.oidc.entraid.issuer-uri: "https://login.microsoftonline.com/<YOUR_TENANT_ID>/v2.0"
camunda.security.authentication.providers.oidc.entraid.redirect-uri: "http://localhost:8080/sso-callback"
camunda.security.authentication.providers.oidc.entraid.audiences: <YOUR_ENTRAID_CLIENTID>
camunda.security.authentication.providers.oidc.entraid.scope:
  ["openid", "profile", "<YOUR_ENTRAID_CLIENTID>/.default"]
```

**Tip**
The `issuer-uri` property is required for each provider configuration.

You can repeat these variables for any number of OIDC IdPs by using a unique `<provider-id>` for each.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-multiple-identity-providers
