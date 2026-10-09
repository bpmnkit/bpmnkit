# Property reference — Expression

See [expressions](https://docs.camunda.io/docs/next/components/concepts/expressions).

  
### application.yaml

### `camunda.expression`

| Property                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Default value | Overridable per Physical Tenant |
| :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :------------------------------ |
| `camunda.expression.timeout` | The timeout for expression evaluation. If an expression takes longer to evaluate than this timeout, the evaluation will be interrupted. An incident is raised if the expression is evaluated for a process instance.Setting a lower value avoids the expression evaluation blocking the execution of other process instances on the same partition for too long. We recommend keeping this below five seconds to avoid unhealthy partitions due to 'actor appears blocked'. | `5s`          | Yes                             |

  
### env

### `CAMUNDA_EXPRESSION`

| Property                     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Default value | Overridable per Physical Tenant |
| :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :------------------------------ |
| `CAMUNDA_EXPRESSION_TIMEOUT` | The timeout for expression evaluation. If an expression takes longer to evaluate than this timeout, the evaluation will be interrupted. An incident is raised if the expression is evaluated for a process instance.Setting a lower value avoids the expression evaluation blocking the execution of other process instances on the same partition for too long. We recommend keeping this below five seconds to avoid unhealthy partitions due to 'actor appears blocked'. | `5s`          | Yes                             |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
