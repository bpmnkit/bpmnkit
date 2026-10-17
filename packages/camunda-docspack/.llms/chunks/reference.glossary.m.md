# Glossary — M

### Management Identity

The Management Identity component provides authorization for the [Camunda 8](#camunda-8) components outside the [Orchestration Cluster](#orchestration-cluster): Camunda Hub and Optimize. As of 8.10, Optimize authenticates with the same settings as the Orchestration Cluster. Camunda Hub keeps its own authentication properties. Management Identity remains responsible for managing users, groups, roles, and permissions for both. See [authentication to the management components](https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-management-components).

### Management plane

The management plane is the part of a Camunda 8 deployment used to design and manage processes and clusters. It consists of [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/index) and [Management Identity](#management-identity), and serves one or more Orchestration Clusters.

In Self-Managed Helm deployments, the management plane is the release with `global.topology.mode` set to `hub`.

- [Deployment topology](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#deployment-topology)

### Manual task

A manual task defines a task that requires human interaction but no external tooling or UI interface. For example, a user reviewing a document or completing a physical task.

Manual tasks are part of [human task orchestration](https://docs.camunda.io/docs/next/guides/getting-started-orchestrate-human-tasks), but differ from [user tasks](#user-task) which define an actionable task assisted by a workflow engine or software application.

- [Manual tasks](https://docs.camunda.io/docs/next/components/modeler/bpmn/manual-tasks/manual-tasks)

### Multi-tenancy

Multi-tenancy allows a single Camunda 8 installation to serve multiple [Logical Tenants](#logical-tenant) while keeping each tenant's data, configurations, and access logically isolated. For strong physical isolation of separate teams or organizations within a single cluster, see [Physical Tenant](#physical-tenant).

- [Multi-tenancy](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy)
- [Logical Tenant](#logical-tenant)
- [Physical Tenant](#physical-tenant)

### Message

A message contains information to be delivered to interested parties during execution of a [process instance](#process-instance). Messages can be published via Kafka or [Zeebe](#zeebe)’s internal messaging system. Messages are associated with timestamp and other constraints such as time-to-live (TTL).

- [Messages](https://docs.camunda.io/docs/next/components/concepts/messages)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
