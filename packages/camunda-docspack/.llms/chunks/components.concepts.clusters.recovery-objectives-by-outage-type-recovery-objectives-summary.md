# Clusters — Recovery objectives by outage type — Recovery objectives summary

| Outage                                | RPO                            | RTO                                          | Recovery                            | Requirement                                            |
| :------------------------------------ | :----------------------------- | :------------------------------------------- | :---------------------------------- | :----------------------------------------------------- |
| Node                                  | Zero                           | Near zero                                    | Automatic                           | None                                                   |
| Availability zone                     | Zero                           | Near zero                                    | Automatic                           | None                                                   |
| Region                                | Time since the restored backup | Depends on data volume and reconnection time | Manual cold recovery that you start | Dual-region backup location in a supported region pair |
| Cloud provider or third-party service | Not defined                    | Not defined                                  | Depends on the provider's recovery  | Not available                                          |
| Platform or cluster incident          | Typically zero                 | Depends on the incident                      | Camunda incident response           | None                                                   |

Near zero means service resumes automatically, typically within seconds, without a backup restore. Requests in progress during that time can fail, so configure your clients and job workers to retry them, for example with exponential backoff.

Your application's overall recovery time also depends on your own job workers and clients being able to reach the cluster and continue processing.

---
Source: https://docs.camunda.io/docs/next/components/concepts/clusters
