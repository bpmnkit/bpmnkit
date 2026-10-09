# Configuration — Configuration file templates

We provide templates that contain all possible configuration settings, along with explanations for each setting, though you may find it easier to search through our [broker](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker) and [gateway](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway) configuration documentation to adjust the templates:

- [`config/defaults.yaml` Standalone Broker (with embedded gateway)](https://github.com/camunda/camunda/blob/main/dist/src/main/config/defaults.yaml) - Complete configuration template for a standalone broker with embedded gateway. Use this as the basis for a single broker deployment for test or development.
- [`config/gateway.default.yaml`](https://github.com/camunda/camunda/blob/main/zeebe/gateway/src/test/resources/configuration/gateway.default.yaml) - Complete configuration template for a standalone gateway.

**Note**
These templates also include the corresponding environment variables to use for every setting.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/configuration
