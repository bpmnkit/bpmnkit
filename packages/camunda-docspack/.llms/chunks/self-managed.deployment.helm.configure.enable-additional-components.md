# Enable additional Camunda components

Enable optional components like Camunda Hub, Management Identity, and Optimize in the Camunda Helm chart.

The default Helm deployment includes the [Orchestration Cluster](https://docs.camunda.io/docs/next/reference/glossary#orchestration-cluster) and Connectors. This page explains how to enable other Camunda components.


## Default vs. additional components

### Enabled by default

- Orchestration Cluster (Zeebe, Zeebe Gateway, Operate, Tasklist, Orchestration Cluster Admin)
- Connectors

### Additional components (must be explicitly enabled)

- Camunda Hub
- Management Identity
- Optimize


## Management Identity

Identity management has two distinct scopes:

- **Orchestration Cluster Admin** - Manages authentication and authorization for core orchestration components (Zeebe, Operate, Tasklist) and their APIs. This is built into the Orchestration Cluster and does not require Management Identity.
- **Management Identity** - Controls access to Camunda Hub and Optimize. This is a separate component that must be explicitly enabled.

Management Identity must be enabled if you want to use any of the following components:

- Camunda Hub
- Optimize

Check the [authentication and authorization](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/index) guide for detailed steps on enabling and configuring Management Identity.

**Info**
If you enable Camunda Hub or Optimize without enabling Management Identity, these components will not function properly, as they require authentication. The Orchestration Cluster (Zeebe, Operate, Tasklist, and Orchestration Cluster Admin) does not depend on Management Identity.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/enable-additional-components
