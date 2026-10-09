# Connectors runtime: Physical Tenant support

Configure one Connectors runtime instance to serve multiple Physical Tenants, with per-tenant job workers, opt-in secret scoping, and inbound webhook routing.


## About

Learn how one Connectors runtime instance can serve multiple Physical Tenants with tenant-specific clients, workers, secrets, and inbound paths.


## Architecture

```mermaid
graph TD
    runtime["Connectors Runtime\n(single instance)"]

    subgraph ptA["Physical Tenant A"]
        workerA["Job Worker\n(type, tenanta)"]
        inboundA["Inbound Connector\n/inbound/tenanta/..."]
    end

    subgraph ptB["Physical Tenant B"]
        workerB["Job Worker\n(type, tenantb)"]
        inboundB["Inbound Connector\n/inbound/tenantb/..."]
    end

    subgraph ptDefault["Physical Tenant default"]
        workerDefault["Job Worker\n(type, default)"]
        inboundDefault["Inbound Connector\n/inbound/default/..."]
    end

    runtime --> workerA
    runtime --> workerB
    runtime --> workerDefault
    runtime --> inboundA
    runtime --> inboundB
    runtime --> inboundDefault

    classDef runtime fill:#e4eef8,stroke:#2272c9,color:#14082c,stroke-width:2px
    classDef tenant fill:#fde8da,stroke:#fc5d0d,color:#14082c
    classDef worker fill:#e8fdf1,stroke:#10c95d,color:#14082c

    class runtime runtime
    class ptA,ptB,ptDefault tenant
    class workerA,workerB,workerDefault,inboundA,inboundB,inboundDefault worker
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/connectors-runtime
