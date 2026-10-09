# Architecture

There are four main components in Zeebe's architecture: clients, gateways, brokers, and exporters.

There are four main components in Zeebe's architecture:

- Clients
- Gateways
- Brokers
- Exporters

![zeebe-architecture](assets/zeebe-architecture.png)

In Camunda 8, you work exclusively with clients. Gateways, brokers, and exporters are pre-configured to provide the service, but are not accessible.

In local or private cloud deployments, all components are relevant.


## Clients

Clients send commands to Zeebe to:

- Deploy processes
- Carry out business logic
  - Start process instances
  - Publish messages
  - Activate jobs
  - Complete jobs
  - Fail jobs
- Handle operational issues
  - Update process variables
  - Resolve incidents

Client applications can be scaled up and down separately from Zeebe. The Zeebe brokers do not execute any business logic.

Clients are libraries you embed in an application (e.g. a microservice that executes your business logic) to connect to a Zeebe cluster.

Clients connect to the Zeebe Gateway via a mix of REST and [gRPC](https://grpc.io). While REST can be served over any HTTP version, the gRPC part of the API requires an HTTP/2-based transport. To learn more about how REST is used in Zeebe, review the [Orchestration Cluster API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview). To learn more about gRPC in Zeebe, review the [Zeebe API (gRPC)](https://docs.camunda.io/docs/next/apis-tools/zeebe-api/grpc). Check out the [API & tools section](https://docs.camunda.io/docs/next/apis-tools/working-with-apis-tools) to find clients in your programming language of choice or create your own.

### Job workers

A job worker is a Zeebe client that uses the client API to first activate jobs, and upon completion, either complete or fail the job.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/architecture
