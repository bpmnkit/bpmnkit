# Physical Tenant isolation model — Architecture

```mermaid
graph TD
    subgraph cluster["Single Orchestration Cluster"]
        cp["Cluster control plane\nshared"]
        gw["Gateways\nshared"]

        subgraph tenantA["Physical Tenant A"]
            raftA["Primary storage\nRaft group A"]
            secA["Secondary storage A"]
            docA["Document store A"]
        end

        subgraph tenantB["Physical Tenant B"]
            raftB["Primary storage\nRaft group B"]
            secB["Secondary storage B"]
            docB["Document store B"]
        end

        cp --> gw
        gw --> raftA
        gw --> raftB
        cp --> tenantA
        cp --> tenantB
    end
```

The diagram shows one Orchestration Cluster boundary with shared control-plane components and tenant-specific execution and storage boundaries.

The same isolation extends to authentication and authorization, and web apps. Each Physical Tenant authenticates through its own identity provider, gets its own Operate, Tasklist, and Admin, and its own backup and restore, while Logical Tenants remain available for lightweight subdivision inside each one:

![Two Physical Tenants inside one Orchestration Cluster, each with its own identity provider, web apps, and secondary storage.](./img/physical-tenant-architecture.png)

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index
