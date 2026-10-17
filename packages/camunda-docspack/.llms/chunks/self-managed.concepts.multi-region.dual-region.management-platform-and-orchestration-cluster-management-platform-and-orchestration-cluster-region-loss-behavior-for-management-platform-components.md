# Dual-Region — Management platform and Orchestration Cluster {#management-platform-and-orchestration-cluster} — Region loss behavior for management platform components

Management platform components don't replicate across regions, so losing the region they run in makes them unavailable until you restore them. If the management platform runs in one of the two dual-region regions, losing that region also stops the Orchestration Cluster until the dual-region failover procedure completes. Failover restores process execution, and deployed processes keep running. It doesn't restore the management platform, which you recover from backups.

Broker processing and authenticated client access recover separately. If the Orchestration Cluster uses OIDC authentication with a provider, such as Keycloak, that runs in the lost region, failover restores broker processing only. Workers, Connectors, and other clients can't get new tokens after their current tokens expire, and users can't sign in to the Orchestration Cluster. Process instances that wait for job workers then stop progressing. Run the OIDC provider where it survives the loss of either dual-region region, or recover it as part of the failover.

| Component                       | State it holds                                                                                 | If its region is lost                                                                                    |
| :------------------------------ | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| Management Identity             | Users, groups, roles, tenants, and OIDC clients                                                | Authentication to Optimize and Camunda Hub fails until you restore it                                    |
| OIDC provider, such as Keycloak | Users, credentials, and client registrations                                                   | Clients of the Orchestration Cluster can't get new tokens, and users can't sign in, until you restore it |
| Camunda Hub                     | Diagrams, projects, and collaboration history in PostgreSQL. Console holds no state of its own | Modeling and deployment from Camunda Hub stop until you restore it                                       |
| Optimize                        | Reports, dashboards, collections, alerts, and its own import position                          | Reporting stops until you restore it, and content created since the last backup is lost                  |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region
