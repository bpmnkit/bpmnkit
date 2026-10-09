# Manual deployment overview — Requirements

Before implementing a reference architecture, review the requirements and guidance outlined below. We are differentiating between `Infrastructure` and `Application` requirements.

### Infrastructure

Any of the following are just suggestions for the minimum viable setup, the sizing heavily depends on your use cases and usage. It is recommended to understand the documentation on [sizing your environment](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment) and run benchmarking to confirm your required needs.

#### Minimum Requirements Per Host

- Modern CPU: 2 cores
- Memory: 4 GB RAM
- Storage: 32 GB SSD-backed, minimum 1,000 IOPS. HDD-backed volume types cannot meet Zeebe's Raft flush latency requirements and are not supported.

Suggested instance types from cloud providers:

- AWS: [m7i](https://aws.amazon.com/ec2/instance-types/m7i/) series
- GCP: [n1](https://cloud.google.com/compute/docs/general-purpose-machines#n1_machines) series

#### Networking

- Stable and high-speed network connection
- Configured firewall rules to allow necessary traffic:
  - **8080**: Web UI / REST endpoint (Orchestration Cluster)
  - **9090**: Connectors
  - **9600**: Management endpoint (Orchestration Cluster)
  - **26500**: gRPC endpoint.
  - **26501**: Gateway-to-broker communication.
  - **26502**: Inter-broker communication.
- Load balancer for distributing traffic (if required)

**Info: Customizing ports**
Some ports can be overwritten and are not definitive, you may conduct the documentation of each component to see how it can be done, in case you want to use a different port. Or in our example `Connectors` and `Web UIs` overlap on 8080 due to which we moved connectors to a different port.

### Application

- Java Virtual Machine, see [supported environments](https://docs.camunda.io/docs/next/reference/supported-environments) for version details.

### Database

- Secondary storage backend (supported RDBMS or Elasticsearch/OpenSearch, depending on your architecture), see [supported environments](https://docs.camunda.io/docs/next/reference/supported-environments) for version details.

Our recommendation is to use an external managed offer as we will not go into detail on how to manage and maintain your database.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/manual
