# Property reference

Learn about the configuration properties available in your Orchestration Cluster.

As a Spring Boot application, the Orchestration Cluster supports standard
[Spring configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html) methods.

The following configurations apply to all components within the Orchestration Cluster.


## API

  
### application.yaml

### `camunda.api.long-polling`

| Property                                       | Description                                                                                                                           | Default value | Overridable per Physical Tenant |
| :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ | :------------ | :------------------------------ |
| `camunda.api.long-polling.enabled`             | Enable [long-polling](https://docs.camunda.io/docs/next/components/concepts/job-workers#long-polling) for the Camunda gRPC API server.                       | `true`        | No                              |
| `camunda.api.long-polling.timeout`             | Set the timeout for long polling in milliseconds.                                                                              | `10000`       | No                              |
| `camunda.api.long-polling.probe-timeout`       | Set the probe timeout for long polling in milliseconds.                                                                        | `10000`       | No                              |
| `camunda.api.long-polling.min-empty-responses` | Set the number of minimum empty responses. A minimum number of responses with jobCount of 0 infers that no jobs are available. | `10s`         | No                              |

  
    
### env

### `CAMUNDA_API_LONGPOLLING`

| Property                                    | Description                                                                                                                           | Default value | Overridable per Physical Tenant |
| :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------ | :------------ | :------------------------------ |
| `CAMUNDA_API_LONGPOLLING_ENABLED`           | Enable [long-polling](https://docs.camunda.io/docs/next/components/concepts/job-workers#long-polling) for the Camunda gRPC API server.                       | `true`        | No                              |
| `CAMUNDA_API_LONGPOLLING_TIMEOUT`           | Set the timeout for long polling in milliseconds.                                                                              | `10000`       | No                              |
| `CAMUNDA_API_LONGPOLLING_PROBETIMEOUT`      | Set the probe timeout for long polling in milliseconds.                                                                        | `10000`       | No                              |
| `CAMUNDA_API_LONGPOLLING_MINEMPTYRESPONSES` | Set the number of minimum empty responses. A minimum number of responses with jobCount of 0 infers that no jobs are available. | `10s`         | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
