# Use connectors in hybrid mode

Learn how to run connectors in hybrid mode.

Outbound
Inbound

**Note**
Hybrid mode is supported as of the connectors `0.23.0` release. Use the latest stable version from the [Camunda connectors Docker registry](https://hub.docker.com/r/camunda/connectors-bundle/tags).

**Hybrid mode** is where you can run a Self-Managed connector runtime instance attached to a Camunda SaaS cluster or another Self-Managed cluster that has another instance of the connector runtime attached.

To name few use-cases where this approach might be useful:

- When you deal with services that must be isolated within private network and must never be exposed to the public internet.
- Infrastructure amendments need to be applied to the connector runtime, such as SSL certificates, mounted volumes, etc.
- Code modifications applied to connector runtime, or specific connector logic.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors-in-hybrid-mode
