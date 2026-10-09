# Debugging the authentication flow — Review logs

Enable detailed logging to trace authentication decisions:

### yaml

```yaml
logging.level:
  org.springframework.security: TRACE
  io.camunda:
    authentication: DEBUG
    security: DEBUG
```

### env

```
LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY=TRACE
LOGGING_LEVEL_IO_CAMUNDA_AUTHENTICATION=DEBUG
LOGGING_LEVEL_IO_CAMUNDA_SECURITY=DEBUG
```

With these settings, you can trace request handling and how Spring Security filter chains determine authentication outcomes.


## Review the startup warnings

The Orchestration Cluster checks its OIDC configuration at startup, without contacting the provider, and writes a warning for each problem it finds. It still starts, so a login can fail later for a problem that was already reported at startup. Read these warnings first.

- The logger `io.camunda.security.spring.oidc.ScopedClientRegistrationFactory` reports a missing client ID, an incomplete set of endpoints, an unusable scope, and a redirect URI that cannot expand to a usable callback URL. Each entry names the provider.
- The logger `io.camunda.security.spring.oidc.OidcRedirectionEndpoint` reports a redirect URI with no callback path, or with a path that has no leading slash. The cluster then uses `{baseUrl}/sso-callback`, and the login completes.

A redirect URI that is unusable in any other way stays as configured. See [redirect URI](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider#redirect-uri).

These checks run once while the cluster starts. The cluster writes each warning one time, and it does not repeat or limit them. The configuration cannot change while the cluster runs, so a new warning needs a restart. A change on the identity provider, such as a different list of permitted redirect URIs, writes no warning at all. Use a synthetic login to detect such a change.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/debugging-authentication
