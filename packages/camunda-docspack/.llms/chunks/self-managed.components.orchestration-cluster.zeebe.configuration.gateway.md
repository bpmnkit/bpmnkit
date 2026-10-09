# Gateway configuration

Analyze how to configure the Zeebe Gateway, including byte sizes, time units, paths, and sample YAML snippets.

The Zeebe Gateway can be configured similarly to the broker via the `application.yaml` file or environment variables. A complete gateway configuration template is available in the [Zeebe repository](https://github.com/camunda/camunda/blob/main/zeebe/gateway/src/test/resources/configuration/gateway.default.yaml).

**Info: Configure an embedded gateway**
When you deploy with Helm (Camunda 8.8+), the gateway runs embedded in the broker by default. In that case, use `zeebe.broker.gateway.*` instead of `zeebe.gateway.*` for any configuration options below, and `ZEEBE_BROKER_GATEWAY_*` instead of `ZEEBE_GATEWAY_*` for environment variables. For a standalone gateway, keep using the `zeebe.gateway.*` / `ZEEBE_GATEWAY_*` prefix.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway
