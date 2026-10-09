# Configuration — Configure the Orchestration Cluster connection for SaaS

To use Camunda 8 SaaS, specify the connection properties:

### env

```bash
CAMUNDA_CLIENT_MODE=saas
CAMUNDA_CLIENT_AUTH_CLIENTID=xxx
CAMUNDA_CLIENT_AUTH_CLIENTSECRET=xxx
CAMUNDA_CLIENT_CLOUD_REGION=bru-2
CAMUNDA_CLIENT_CLOUD_CLUSTERID=xxx
```

### application.yaml

```yaml
camunda:
  client:
    mode: saas
    auth:
      client-id: xxx
      client-secret: xxx
    cloud:
      region: bru-2
      cluster-id: xxx
```

If you are connecting a local connector runtime to a SaaS cluster, you may want to review our [guide to using connectors in hybrid mode](https://docs.camunda.io/docs/next/components/connectors/use-connectors-in-hybrid-mode).


## Manual discovery of connectors

By default, the connector runtime picks up outbound connectors available on the classpath automatically.
To disable this behavior, use the following environment variables to configure connectors explicitly:

| Environment variable                          | Purpose                                                       |
| :-------------------------------------------- | :------------------------------------------------------------ |
| `CONNECTOR_{NAME}_FUNCTION` (required)        | Function to be registered as job worker with the given `NAME` |
| `CONNECTOR_{NAME}_TYPE` (optional)            | Job type to register for worker with `NAME`                   |
| `CONNECTOR_{NAME}_INPUT_VARIABLES` (optional) | Variables to fetch for worker with `NAME`                     |
| `CONNECTOR_{NAME}_TIMEOUT` (optional)         | Timeout in milliseconds for worker with `NAME`                |

Through this configuration, you define all job workers to run.

Specifying optional values allows you to override `@OutboundConnector`-provided connector configuration.

```bash
CONNECTOR_HTTPJSON_FUNCTION=io.camunda.connector.http.rest.HttpJsonFunction
CONNECTOR_HTTPJSON_TYPE=non-default-httpjson-task-type
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
