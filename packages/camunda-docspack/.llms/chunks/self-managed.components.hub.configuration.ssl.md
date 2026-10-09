# SSL

Read details on additional SSL configuration for Camunda Hub.

By default, communication between Camunda Hub and Identity and the Camunda Hub components is not encrypted, as it usually happens backend-to-backend within the same [Docker](https://docs.camunda.io/docs/next/self-managed/deployment/docker/docker) network or [Kubernetes](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install) cluster.
However, you can enable TLS-encrypted communication by following the steps below (for example, if backend-to-backend communication is not possible in a custom Camunda 8 installation setup).


## Configuring secure connections to Identity

### Configure the Identity base URL

For the `restapi` container, provide a URL that starts with `https://` (for example `https://identity.example.com`) as the base URL of the Identity instance.

### envVars

```
CAMUNDA_IDENTITY_BASEURL=https://identity.example.com
```

### applicationYaml

```yaml
camunda.identity.base-url: https://identity.example.com
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/ssl
