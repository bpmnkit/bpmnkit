# Glossary — R

### RDBMS

RDBMS (Relational Database Management System) refers to a user-managed relational database used as a secondary storage backend in Camunda 8 Self-Managed deployments, depending on the component and configuration. An external RDBMS is used for query and retention use cases, not for core workflow execution state.

- [Helm database configuration (RDBMS)](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms)

See also: [Secondary storage](#secondary-storage)

### Record

A record represents a command or an event. For example, a command to create a new [process instance](#process-instance), or a state transition of an executing [process instance](#process-instance) representing an [event](#event) at a given point in time would result to generation of a record. During the execution lifecycle of a process instance, numerous records are generated to capture various commands and events generated. Records are stored in the log.

- [Internal processing](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/internal-processing#events-and-commands)

### Recovery Point Objective (RPO)

Multi-region resilience: Maximum tolerable amount of data loss, measured as the time between the last persisted consistent backup and the moment of failure.

### Recovery Time Objective (RTO)

Multi-region resilience: Maximum tolerable time from failure detection to service restoration in a functional state.

### Reference architecture

Reference architectures provide comprehensive blueprints for designing and implementing scalable, robust, and adaptable Camunda 8 self-managed installations. Reference architectures serve as starting points that should be adapted to fit the specific needs and constraints of your organization and infrastructure.

- [Reference architectures](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture)

### Replication

Replication is the act of copying data in a [partition](#partition) from a [leader](#leader) to its [followers](#follower) within a clustered [Zeebe](#zeebe) deployment. After replication, the leader and followers of a partition will have the exact same data. Replication allows the system to be resilient to [brokers](#zeebe-broker) going down.

- [Clustering](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering#raft-consensus-and-replication-protocol)

### Replication factor

This is the number of times data in a [partition](#partition) is copied. This depends on the number of [brokers](#zeebe-broker) in a [cluster](#zeebe-cluster). A cluster with one [leader](#leader) and two [followers](#follower) has a replication factor of three, as data in each partition needs to have three copies.

We recommend running an odd replication factor.

- [Partitions](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/partitions#replication)

### Request timeout

How long a [client](#zeebe-client) waits for a response from the [broker](#zeebe-broker) after the client submits a request. If a response is not received within the client request timeout, the client considers the broker unreachable.

- [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/zeebe-api-rest/zeebe-api-rest-overview)
- [Zeebe API (gRPC)](https://docs.camunda.io/docs/next/apis-tools/zeebe-api/grpc)

### RFC

RFC stands for Remote Function Call, a protocol used by SAP to enable communication and data exchange between SAP systems or between SAP and external systems.

Camunda can use RFC to call SAP functions directly as part of a business process. This allows Camunda to trigger SAP transactions, retrieve data, or update records within an SAP system, integrating SAP functionality seamlessly into broader automated workflows.

- [RFC](https://docs.camunda.io/docs/next/components/camunda-integrations/sap/rfc-connector)

### Robotic process automation (RPA)

The use of software robots to automate repetitive, rule-based business tasks. RPA bots emulate human actions in digital systems, enhancing speed and accuracy.

### Root process instance

The [process instance](#process-instance) at the top of a hierarchy of related process instances. It was started directly, not created by a [call activity](https://docs.camunda.io/docs/next/components/modeler/bpmn/call-activities/call-activities).

See also: [Parent process instance](#parent-process-instance), [Child process instance](#child-process-instance)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
