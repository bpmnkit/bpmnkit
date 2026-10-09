# Multi-tenancy

Isolate data, configurations, and operations for multiple teams, departments, or organizations within a single Camunda 8 installation.


## About

Camunda 8 supports three distinct multi-tenancy models, each with different isolation levels and operational characteristics.

All models run on the same platform and tooling. They differ in how much they isolate, from a shared database separated by a tenant ID, to a fully separate cluster per tenant.

### Choose your model

Choose the model that best fits your isolation requirements and operational constraints:

| Aspect                     | Logical Tenant                   | Physical Tenant                         | Multi-Cluster                             |
| :------------------------- | :------------------------------- | :-------------------------------------- | :---------------------------------------- |
| **Availability**           | Self-Managed and SaaS            | Self-Managed only                       | Self-Managed and SaaS                     |
| **Isolation**              | Logical only                     | Strong physical data isolation          | Full physical isolation                   |
| **Data sharing**           | Single shared database           | Separate data per tenant                | Separate per cluster                      |
| **Backup/restore**         | Cluster-level only               | Independent per tenant                  | Independent per cluster                   |
| **Cost**                   | Most efficient                   | Balanced                                | Most expensive                            |
| **Operational complexity** | Low                              | Medium                                  | High                                      |
| **Use case**               | Small teams, low-risk separation | Multiple teams, strong isolation needed | Separate organizations, maximum isolation |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/index
