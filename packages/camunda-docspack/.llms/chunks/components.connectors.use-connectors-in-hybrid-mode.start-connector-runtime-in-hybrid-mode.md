# Use connectors in hybrid mode — Start connector runtime in hybrid mode

### Prerequisites

Ensure you have a running Camunda cluster, and a pair of `Client ID`/`Client Secret` with `Orchestration Cluster REST API` scope. Learn more about [how to obtain required credentials](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients).

To use secrets managed by the SaaS environment, add the `Secrets` scope.

### Option 1: Get connector runtime from Docker registry

**Note: When to use?**
Use this option when you don't need to make any code modifications to either connector runtime, or a specific connector.
This option allows you to start the connector runtime bundle that runs all of [Camunda's officially-supported connectors](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/available-connectors-overview).

Run the following script:

```shell
docker run --rm --name=HybridConnectorRuntime \
    -e CAMUNDA_CLIENT_MODE=saas \
    -e CAMUNDA_CLIENT_CLOUD_CLUSTERID='<YOUR_CLUSTER_ID>' \
    -e CAMUNDA_CLIENT_CLOUD_REGION='<YOUR_CLUSTER_REGION>' \
    -e CAMUNDA_CLIENT_AUTH_CLIENTID='<YOUR_CLIENT_ID>' \
    -e CAMUNDA_CLIENT_AUTH_CLIENTSECRET='<YOUR_CLIENT_SECRET>' \
    -e CONNECTOR_HTTP_REST_TYPE='io.camunda:http-json:local' \
        camunda/connectors-bundle:<desired-version>
```

### Option 2: Build your own runtime

**Note: When to use?**
Use this option when you make modifications to the original connector runtime, existing connectors, or
other related changes.
This option allows you to start the connector runtime bundle with provided connectors.

1. Ensure `docker` is installed.
2. Clone [https://github.com/camunda/connectors](https://github.com/camunda/connectors).
3. Go to `<connectors-root>/bundle/default-bundle`.
4. Build a connector image, e.g. `docker build -f Dockerfile -t myorg/my-connectors-bundle:<desired-version> .`.
5. Run the same `docker run ...` command as in [Option 1](#option-a-get-connectors-runtime-from-docker-registry).

### Explanation

Note the line `-e CONNECTOR_HTTP_REST_TYPE='io.camunda:http-json:local'`. This line means we have to override
`CONNECTOR_X_TYPE` with a given type. In this case, we want to register a local Self-Managed HTTP REST connector as `io.camunda:http-json:local`.

The `X` is normalized to the environment variable connector name. For example, the [HTTP REST connector](https://github.com/camunda/connectors/blob/main/connectors/http/rest/src/main/java/io/camunda/connector/http/rest/HttpJsonFunction.java#L33)
`HTTP REST` name becomes `HTTP_REST`, or the [Kafka consumer connector](https://github.com/camunda/connectors/blob/main/connectors/kafka/src/main/java/io/camunda/connector/kafka/inbound/KafkaExecutable.java#L20) name
becomes `KAFKA_CONSUMER`. Therefore, to override it one would need to pass in the `CONNECTOR_KAFKA_CONSUMER_TYPE=xxx` environment variable.

#### Common connector types

| Connector                 | Environment variable               | Example value                         |
| ------------------------- | ---------------------------------- | ------------------------------------- |
| HTTP REST                 | `CONNECTOR_HTTP_REST_TYPE`         | `io.camunda:http-json:local`          |
| AWS SQS (Outbound)        | `CONNECTOR_AWS_SQS_OUTBOUND_TYPE`  | `io.camunda:aws-sqs:local`            |
| Kafka consumer (Inbound)  | `CONNECTOR_KAFKA_CONSUMER_TYPE`    | `io.camunda:connector-kafka:local`    |
| Kafka producer (Outbound) | `CONNECTOR_KAFKA_PRODUCER_TYPE`    | `io.camunda:connector-kafka:local`    |
| SendGrid                  | `CONNECTOR_SENDGRID_TYPE`          | `io.camunda:sendgrid:local`           |
| Slack                     | `CONNECTOR_SLACK_TYPE`             | `io.camunda:slack:local`              |
| Gmail                     | `CONNECTOR_GMAIL_TYPE`             | `io.camunda:gmail:local`              |
| Google Drive              | `CONNECTOR_GOOGLE_DRIVE_TYPE`      | `io.camunda:google-drive:local`       |
| RabbitMQ (Inbound)        | `CONNECTOR_RABBITMQ_CONSUMER_TYPE` | `io.camunda:connector-rabbitmq:local` |
| RabbitMQ (Outbound)       | `CONNECTOR_RABBITMQ_PRODUCER_TYPE` | `io.camunda:connector-rabbitmq:local` |

For a complete list of all available connectors and their types, see the [available connectors overview](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/available-connectors-overview) or check the [official connectors repository](https://github.com/camunda/connectors).

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors-in-hybrid-mode
