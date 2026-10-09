# Orchestration Cluster authentication in Self-Managed — Unprotected API mode

In this mode, API access is unprotected with no authentication required for APIs. This mode can be enabled with both Basic authentication and OIDC.

By default, [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run) and [Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose) are configured in unprotected API mode for local development quick start.

**Caution**
This mode should never be used in production environments.

**Note**
If you need to use authorizations for access control, you must protect APIs by disabling the unprotected API mode. To learn more, see [Orchestration Cluster authorization](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations).

### Example configuration

  
### env

```yaml
CAMUNDA_SECURITY_AUTHENTICATION_UNPROTECTEDAPI=true
```
  
  
### yaml

```yaml
camunda.security.authentication.unprotected-api: true
```
  
  
### helm

```yaml
orchestration.security.authentication.unprotectedApi=true
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-orchestration-cluster
