# Broker configuration — Configuration — Multitenancy configuration

For embedded gateway configuration, use the current gateway configuration properties documented in the gateway configuration guide. This page documents broker configuration and should use the unified `camunda.*` properties where available.

#### zeebe.broker.gateway.multitenancy

**Note**
This section describes configuration for **logical tenants**. For strong physical isolation of separate teams or organizations within a single cluster, see [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants).

Multi-tenancy in Zeebe can be configured with the following configuration properties.
Multi-tenancy is disabled by default.
Read more [in the multi-tenancy documentation](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy).

**Note**
For now, multi-tenancy is only supported in combination with Identity.
To use multi-tenancy, you must set [`authentication.mode`](#zeebebrokergatewaysecurityauthentication) to `'identity'` and specify the
`camunda.identity.baseUrl` property or the [corresponding Camunda Identity environment variable](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables#core-configuration)
as well.

**Note**
If you are using a standalone gateway, refer to the [gateway configuration guide](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway).

| Field   | Description                                                                                                                                                  | Example value |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| enabled | Enable multitenancy in the embedded gateway. This setting can also be overridden using the environment variable `ZEEBE_BROKER_GATEWAY_MULTITENANCY_ENABLED`. | false         |

##### YAML snippet

```yaml
broker:
  gateway:
    multitenancy:
      enabled: false
```

#### zeebe.broker.gateway.security.authentication

| Field | Description                                                                                                                                                                                                                                                                                                                                                                                                          | Example value |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| mode  | Controls which authentication mode is active; supported modes are `none` and `identity`. If `identity` is set, authentication will be done using [camunda-identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview), which needs to be configured in the corresponding subsection. This setting can also be overridden using the environment variable `ZEEBE_BROKER_GATEWAY_SECURITY_AUTHENTICATION_MODE`. | none          |

##### YAML snippet

```yaml
security:
  authentication:
    mode: none
```

#### zeebe.broker.gateway.security.authentication.identity

**Note**
The Zeebe configuration properties for Camunda Identity are deprecated as of version `8.4.0`. Use the dedicated
Camunda Identity properties or the [corresponding environment variables](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables#core-configuration).

| Field            | Description                                                                                                                                                                                                 | Example value                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| issuerBackendUrl | The URL to the auth provider backend, used to validate tokens. This setting can also be overridden using the environment variable `ZEEBE_BROKER_GATEWAY_SECURITY_AUTHENTICATION_IDENTITY_ISSUERBACKENDURL`. | http://keycloak:18080/auth/realms/camunda-platform |
| audience         | The required audience of the auth token. This setting can also be overridden using the environment variable `ZEEBE_BROKER_GATEWAY_SECURITY_AUTHENTICATION_IDENTITY_AUDIENCE`.                               | zeebe-api                                          |
| baseUrl          | The URL to the Identity instance. This setting can also be overridden using the environment variable `ZEEBE_BROKER_GATEWAY_SECURITY_AUTHENTICATION_IDENTITY_BASEURL`.                                       | http://identity:8084                               |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
