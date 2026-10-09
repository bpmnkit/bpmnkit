# Configuration

Let's analyze how to configure Zeebe.

Zeebe can be configured through the following:

- Configuration files
- Environment variables
- A mix of both

If both configuration files and environment variables are present, environment variables overwrite settings in configuration files.

To make small changes to the configuration, we recommend using environment variables.

To make big changes to the configuration, we recommend using a configuration file.

The configuration is applied during startup of Zeebe. It is not possible to change the configuration at runtime.


## Default configuration

The default configuration is located in `config/application.yaml`. This configuration contains the most common configuration settings for a standalone broker. It also lists the corresponding environment variable for each setting.

**Note**
The default configuration is not suitable for a standalone gateway node. To run a standalone gateway node, take a look at [the gateway configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway) or `/config/gateway.default.yaml`.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/configuration
