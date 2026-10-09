# Configuration — Licensing

See the [core settings documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/licensing).


## Webserver and security

See the [core settings documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/webserver).


## Secondary storage

Review the [secondary storage documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#secondary-storage) and [secondary storage configuration](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/configuring-secondary-storage).


## Operation executor

Operations are user operations, like cancellation of process instance(s) or updating the variable value.

Operations are executed in a multi-threaded manner.

| Name                                           | Description                      | Default value |
| ---------------------------------------------- | -------------------------------- | ------------- |
| camunda.operate.operationExecutor.threadsCount | How many threads should be used. | 3             |

### Snippet from application.yml

```yaml
camunda.operate:
  operationExecutor:
    threadsCount: 3
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/operate/operate-configuration
