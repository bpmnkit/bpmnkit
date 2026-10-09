# Properties reference — Deprecated properties

**Caution**
The following properties are deprecated. See the replacement property and related hints.

The deprecated properties are still effective if their replacement is not used yet. The SDK hints on the usage of deprecated properties by logging warn statements during startup.

### `camunda.client`

Deprecated properties for the Camunda client.

  
    Property
    Replacement
    Hint
  

  

  

N/A

  

  

N/A

  

  

N/A

### `camunda.client.auth`

Deprecated properties for authenticating the Camunda client.

  
    Property
    Replacement
    Hint
  

  

  

N/A

### `camunda.client.cloud`

Deprecated properties for connecting the Camunda client to SaaS. These are used to compose default connection details when the client is configured to `camunda.client.mode: saas`.

  
    Property
    Replacement
    Hint
  

  

  

N/A

### `camunda.client.cluster-variables`

Deprecated properties for setting cluster variables at startup.

  
    Property
    Replacement
    Hint
  

  

  

Cluster variables are now set in a single list instead of separate maps for global and tenant variables.

  

  

Cluster variables are now set in a single list instead of separate maps for global and tenant variables.

### `camunda.client.identity`

Deprecated properties for identity settings.

  
    Property
    Replacement
    Hint
  

  

  

Identity is now part of Camunda.

  

Identity is now part of Camunda.

  

  

Identity is now part of Camunda.

  

  

Identity is now part of Camunda.

### `camunda.client.zeebe`

Deprecated properties for Zeebe client settings.

  
    Property
    Replacement
    Hint
  

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

### `camunda.client.zeebe.defaults`

Deprecated default properties for Zeebe job workers.

  
    Property
    Replacement
    Hint
  

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

### `camunda.client.zeebe.deployment`

Deprecated deployment properties for Zeebe.

  
    Property
    Replacement
    Hint
  

  

  

N/A

### `camunda.client.zeebe.override`

Deprecated properties for overriding individual job workers registered to the Camunda client. Replaced by `camunda.client.worker.override`.

### `common`

Deprecated common client properties.

  
    Property
    Replacement
    Hint
  

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

The REST address is the unified endpoint for all interaction with Camunda.

  

  

N/A

### `common.keycloak`

Deprecated Keycloak-specific properties.

  
    Property
    Replacement
    Hint
  

  

There is no keycloak-specific configuration for Camunda; the issuer is provided as a URL.

  

  

There is no keycloak-specific configuration for Camunda; the issuer is provided as a URL.

  

  

There is no keycloak-specific configuration for Camunda; the issuer is provided as a URL.

### `zeebe.client`

Deprecated Zeebe client properties.

  
    Property
    Replacement
    Hint
  

  

Only the environment variables belonging to the Spring SDK are applied.

  

  

Client modes are now available.

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

### `zeebe.client.broker`

Deprecated Zeebe broker properties.

  
    Property
    Replacement
    Hint
  

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

### `zeebe.client.cloud`

Deprecated Zeebe cloud connection properties.

  
    Property
    Replacement
    Hint
  

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

  

The Zeebe client URL is now configured as HTTP&#x2F;HTTPS URL.

  

  

N/A

  

  

N/A

### `zeebe.client.job`

Deprecated Zeebe job worker properties.

  
    Property
    Replacement
    Hint
  

  

  

N/A

  

  

N/A

### `zeebe.client.message`

Deprecated Zeebe message properties.

  
    Property
    Replacement
    Hint
  

  

  

N/A

  

  

N/A

### `zeebe.client.security`

Deprecated Zeebe security properties.

  
    Property
    Replacement
    Hint
  

  

  

N/A

  

  

N/A

  

plaintext is now determined by the URL protocol (HTTP or HTTPS).

### `zeebe.client.worker`

Deprecated Zeebe job worker properties.

  
    Property
    Replacement
    Hint
  

  

  

N/A

  

  

N/A

  

  

N/A

  

  

N/A

### `zeebe.client.worker.override`

Deprecated properties to override the individual job workers registered with the Camunda client. Replaced by `camunda.client.worker.override`.

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/properties-reference
