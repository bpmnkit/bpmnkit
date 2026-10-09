# Camunda components flow control configuration — Configure temporary write limits

The flow control endpoint can be used to adjust the flow control configuration temporarily, without having to reset your clusters.

**Caution**
The flow control endpoint is intended as a temporary solution, and changes should be reverted after the issue is addressed. Permanent configuration changes should be made through the environment variables.

Configuring flow control through the available endpoint does not preserve the configuration in the broker state. If the broker restarts, any leader
partition in this broker will revert to the defined configuration in the environment variables.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/configure-flow-control/configure-flow-control
