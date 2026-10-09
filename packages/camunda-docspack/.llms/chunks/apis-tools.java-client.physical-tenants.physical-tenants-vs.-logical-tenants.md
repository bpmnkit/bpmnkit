# Physical Tenants — Physical Tenants vs. logical tenants

These two mechanisms are independent and can be combined:

|                         | Logical tenant                                  | Physical Tenant                                                      |
| ----------------------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| **Configured on**       | Job worker or API call (`tenantId`/`tenantIds`) | The client itself (`physicalTenantId`)                               |
| **Scope**               | A subdivision within one Physical Tenant        | A separate, isolated execution unit within the Orchestration Cluster |
| **Isolation**           | Logical only — shared engine, shared storage    | Strong — separate primary/secondary storage, separate authorization  |
| **Targeting mechanism** | API parameter, per call or per worker           | gRPC header and REST path prefix, per client instance                |

A Physical Tenant can have its own set of logical tenants. For example, Physical Tenant `teama` and Physical Tenant `teamb` can each have a logical tenant called `foo` — `teama`'s `foo` and `teamb`'s `foo` are completely isolated from each other.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/physical-tenants
