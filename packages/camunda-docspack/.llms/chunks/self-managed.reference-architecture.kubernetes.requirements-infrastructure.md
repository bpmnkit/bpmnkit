# Kubernetes deployment overview — Requirements — Infrastructure

We recommend using a [certified Kubernetes](https://www.cncf.io/training/certification/software-conformance/#benefits) distribution.

Camunda 8 is not tied to a specific Kubernetes version. To simplify deployment, we provide a [Helm chart](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install). For supported Kubernetes versions, see [supported environments](https://docs.camunda.io/docs/next/reference/supported-environments#deployment-options).

#### Minimum cluster requirements

The following are suggested minimum requirements to get started. There is no one-size-fits-all configuration: sizing depends heavily on your specific use cases and workload, so treat these values as a baseline rather than a strict requirement. Refer to [sizing your environment](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment) and [Self-Managed resource planning](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-self-managed#disk-space), and conduct benchmarking to determine your exact needs.

- **4 Kubernetes nodes**
  - CPU: 4 modern cores
  - Memory: 16 GiB
- **Persistent volumes**
  - 3,000 IOPS baseline
  - 125 MiB/s throughput baseline
  - 32 GiB minimum capacity
  - SSD-backed volumes only. HDD-backed volumes are not supported.
  - Avoid burstable volume types unless they can sustain the target IOPS and throughput continuously without relying on burst credits.

**Note: Storage performance figures are a baseline, not a strict requirement**
The storage performance figures in this section and in the platform-specific sections below (for example, 3,000 IOPS and 125 MiB/s throughput) are a starting point, not hard requirements validated by benchmarking. The same targets apply across all providers (OpenShift, EKS, AKS, GKE, and generic Kubernetes); there is no provider-specific benchmark behind them. Actual needs vary with your workload, throughput, data retention, and exporter load. On providers where disk performance scales with capacity (for example, GKE `pd-ssd`), reaching the IOPS and throughput baseline can require a disk larger than the 32 GiB minimum capacity. For production sizing, see [Self-Managed resource planning](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-self-managed) and benchmark against your own workload.

Storage type, however, is a strict requirement: HDD-backed volumes cannot meet Zeebe's Raft protocol disk flush requirements, which demand consistent single-digit-millisecond write latency, and are not supported.

The same SSD requirement applies to secondary storage, whether you run Elasticsearch/OpenSearch or an RDBMS. See the [Database](#database) section for details.

#### Networking

Networking is largely managed through services and load balancers. The following outlines typical port usage, which may require whitelisting in private networks:

- Stable, high-speed connection
- Firewall rules for:
  - `80`: Web UI (Management Identity, Hub, and IdP if co-located)
  - `82`: Metrics (Management Identity)
  - `8080`: REST/Web UI (Connectors, Orchestration Cluster)
  - `8091`: Management (Hub)
  - `8092`: Management (Optimize)
  - `9600`: Management (Orchestration Cluster)
  - `26500`: gRPC endpoint
  - `26501`: Gateway-to-broker
  - `26502`: Inter-broker

A load balancer is recommended to distribute traffic and expose Camunda 8 to users as needed.

The exposed Kubernetes service port may differ from the internal component port. Refer to the rendered Helm chart or component configuration for accurate target ports.

**Note: Databases**
Database ports are not included here, as databases should be maintained outside of Camunda. Default ports may vary by environment.

Typical defaults include:

- `5432`: PostgreSQL (Management Identity, Camunda Hub, and PostgreSQL secondary storage when used)
- `9200`, `9300`, `9600`: Document-store secondary storage (Elasticsearch/OpenSearch)

##### Load balancer

The Zeebe Gateway as part of the Orchestration Cluster requires gRPC, which itself requires HTTP/2 to be used. It is recommended to secure the endpoint with a TLS certificate.

**Tip**
If you do not rely on the gRPC capabilities of Camunda 8, you can safely disregard this and use the Orchestration Cluster REST API instead.

Camunda 8 supports both Kubernetes traffic APIs, and you can use either:

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes
