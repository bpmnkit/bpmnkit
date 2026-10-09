# Production architecture for Camunda 8 with RDBMS — Example topology

For production deployments with RDBMS, Camunda recommends a **HA Zeebe cluster backed by an external managed RDBMS**:

```mermaid
graph TB
    subgraph oc["Orchestration Cluster (HA)"]
        direction TB
        gateway["<b>Gateway</b><br/>(gRPC / HTTP)"]
        subgraph brokers["Brokers"]
            b1["Broker 1<br/>(AZ-1)"]
            b2["Broker 2<br/>(AZ-2)"]
            b3["Broker 3<br/>(AZ-3)"]
        end
        api["<b>Orchestration Cluster API (v2)</b>"]

        gateway --> brokers
        gateway --> api
        b1 -.->|gRPC| b2
        b2 -.->|gRPC| b3
        b1 -.->|gRPC| b3
    end

    subgraph storage["Secondary Storage"]
        rdbms["<b>External RDBMS</b><br/>PostgreSQL • MariaDB<br/>Oracle • MySQL • SQL Server<br/><br/>HA: 3-way replication<br/>across AZs"]
        opt["<b>Elasticsearch/OpenSearch</b><br/>(for Optimize only)"]
    end

    clients["<b>Clients</b><br/>Web UIs • Workers • Applications<br/>Operate • Tasklist • Identity • Connectors"]

    clients --> gateway
    brokers -->|Export events| rdbms
    brokers -->|Export analytics<br/>Optional| opt

    style oc fill:#e1f5ff
    style storage fill:#fff3e0
    style gateway fill:#f3e5f5
```

### Key characteristics

#### Clustering

- Minimum three brokers for production HA
- Each broker in separate availability zone
- Default replication factor 3 (spans AZs)

#### Secondary storage

- Single external managed RDBMS instance
- Database handles replication and failover
- Camunda does not manage database HA

#### Data flow

- Processes are executed
- State is flushed to RDBMS
- Orchestration Cluster applications (Operate, Tasklist, and Identity) and API clients access data through the Orchestration Cluster interfaces; they do not directly access secondary storage

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/rdbms-production-architecture
