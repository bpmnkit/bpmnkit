# Connect Admin to an identity provider — Logout handling (RP-initiated logout)

When Orchestration Cluster Admin is configured with an external OIDC-compliant identity provider (IdP), you can enable relying party (RP)-initiated logout so that signing out of Camunda also triggers a logout at the IdP.

**Note**
This applies to Self-Managed Orchestration Clusters only. RP-initiated logout is not supported in SaaS.

### Configure RP-initiated logout

#### Enable or disable RP-initiated logout

Enable or disable RP-initiated logout using the following setting:

### yaml

```yaml
camunda:
  security:
    authentication:
      oidc:
        idp-logout-enabled: true|false
```

### env

```
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_IDPLOGOUTENABLED=<true|false>
```

**Note**
RP-initiated logout is enabled by default for all new deployments.

**Logout behavior depends on this setting:**

- **Orchestration Cluster-only logout (RP-initiated logout disabled)**
  - Clears only the Orchestration Cluster session.
  - No request is sent to the IdP, so the user remains signed in there.

- **RP-initiated logout (enabled)** (default for new 8.9+ installations)
  - Clears the Orchestration Cluster session and calls the IdP logout endpoint.
  - Signs the user out of Orchestration Cluster Admin, Tasklist, Operate, and the IdP.
  - Redirects the user to the login page of the Camunda app where logout was initiated.
  - Logout behavior for other applications using the same IdP depends on the IdP’s RP-initiated logout implementation.

Existing Self-Managed deployments upgraded from earlier versions can continue to use Orchestration Cluster-only logout. To preserve the previous behavior after upgrading, explicitly set the `IDPLOGOUTENABLED` configuration property to `false`.

#### Configure the IdP logout endpoint

By default, Admin retrieves the IdP logout endpoint from the OIDC discovery document (the `.well-known` endpoint). If you do not use `issuer-uri` and instead configure endpoints manually, define the logout endpoint alongside `authorization-uri`, `token-uri`, and `jwk-set-uri`, as shown in the [special OIDC configuration cases](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/special-oidc-cases):

### yaml

```yaml
camunda.security:
  authentication:
    oidc:
      authorization-uri: https://login.microsoftonline.com/<YOUR_TENANT_ID>/oauth2/v2.0/authorize
      token-uri: https://login.microsoftonline.com/<YOUR_TENANT_ID>/oauth2/v2.0/token
      jwk-set-uri: https://login.microsoftonline.com/<YOUR_TENANT_ID>/discovery/v2.0/keys
      end-session-endpoint-uri: https://login.microsoftonline.com/<YOUR_TENANT_ID>/oauth2/v2.0/logout
```

### env

```bash
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_ENDSESSIONENDPOINTURI=https://login.microsoftonline.com/<YOUR_TENANT_ID>/oauth2/v2.0/logout
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_AUTHORIZATIONURI=https://login.microsoftonline.com/<YOUR_TENANT_ID>/oauth2/v2.0/authorize
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_TOKENURI=https://login.microsoftonline.com/<YOUR_TENANT_ID>/oauth2/v2.0/token
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_JWKSETURI=https://login.microsoftonline.com/<YOUR_TENANT_ID>/discovery/v2.0/keys
```

#### Configure the post-logout redirect URL in the IdP

To ensure users are redirected correctly after logout, configure a post-logout redirect URL in your IdP. The post-logout URL is the Camunda hostname, context path (if applicable) plus `/post-logout`.

For example, if Admin is accessible at `http://localhost:8080`, configure the following post-logout redirect URL in your IdP:

```
http://localhost:8080/post-logout
```

For hostname and context path configuration, adjust the URL accordingly. For example, if your Camunda deployment is accessible at `http://localhost:8080/orchestration`, configure the following post-logout redirect URL in the IdP:

```
http://localhost:8080/orchestration/post-logout
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
