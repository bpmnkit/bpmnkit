# Admin in Self-Managed — Enable API authentication and authorizations

In Camunda 8 Run installations, Basic authentication is enabled for the Orchestration Cluster web components, but the API is unprotected, and [authorizations](https://docs.camunda.io/docs/next/components/admin/authorization) are disabled. API protection and authorizations can both be enabled by modifying your `application.yaml` or environment variables:

### application-properties

```yaml
camunda:
  security:
    authentication:
      unprotected-api: false
    authorizations:
      enabled: true
```

### env

```shell
CAMUNDA_SECURITY_AUTHENTICATION_UNPROTECTED-API=false
CAMUNDA_SECURITY_AUTHORIZATIONS_ENABLED=true
```

### helm

```yaml
orchestration:
  security:
    authentication:
      unprotectedApi: false
    authorizations:
      enabled: true
```

**Note**
To enable authorizations, API protection must also be enabled.

Basic authentication credentials are then required when making API requests, as in the following:

```shell
curl --request POST 'http://localhost:8080/v2/process-definitions/search'  \
  -u demo:demo \
  --header 'Content-Type: application/json' \
  --data-raw '{}'
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview
