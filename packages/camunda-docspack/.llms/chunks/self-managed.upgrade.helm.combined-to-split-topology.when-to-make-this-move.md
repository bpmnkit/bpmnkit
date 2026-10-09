# Move from a combined release to the split topology — When to make this move

Make it when you need something the combined release can't give you:

- Several Orchestration Clusters sharing one Camunda Hub and one Management Identity.
- Independent upgrade, scaling, or removal of a cluster without touching the Hub plane.
- Physical Tenants with a separate Optimize instance per tenant.

If none of those apply, staying on a combined release is a fully supported long-term choice.


## Prerequisites

| Prerequisite                | Detail                                                                                                                                                                                                      |
| :-------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Already on 8.10 and healthy | Complete [upgrade Camunda 8.9 to 8.10 using Helm](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100) first. Don't combine a version upgrade with a topology change                                                  |
| External data services      | Management Identity and Camunda Hub databases, and Orchestration Cluster secondary storage, all externally managed. See [migrate off the bundled databases first](#migrate-off-the-bundled-databases-first) |
| OIDC with a pinned issuer   | Basic authentication isn't supported for Hub topology connections or Physical Tenants. See [pin the issuer](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release#pin-the-issuer)         |
| Tested backup and restore   | A verified restore of every data store: broker volumes, secondary storage, and both relational databases                                                                                                    |
| A non-production rehearsal  | Run the whole procedure against a copy of your production configuration before you touch production                                                                                                         |

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology
