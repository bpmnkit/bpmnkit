# Move from a combined release to the split topology — Moving a cluster to a different release, namespace, or Kubernetes cluster

This procedure keeps the Orchestration Cluster in its existing release and namespace. Moving an Orchestration Cluster to a different release name, namespace, or Kubernetes cluster isn't covered: broker volumes hold the live process state and don't move between releases. If you need to do this, contact Camunda before you plan it.


## Roll back

| After step                         | To roll back                                                                                                                                                                                                             |
| :--------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Step 2, release converted          | `helm rollback` the orchestration release to its previous revision. Broker volumes are unchanged, and the combined release's Management Identity and Camunda Hub return against their databases                          |
| Step 3 or 4, Hub release installed | Uninstall the Hub release and confirm its Management Identity pods have terminated, then `helm rollback` the orchestration release as for step 2. Don't roll back while the Hub release's Management Identity is running |
| Step 5, Optimize separated         | Uninstall the Optimize release, remove the explicit exporter, and re-enable `optimize` in the orchestration release with the same reader and application prefixes                                                        |
| Step 6, cleanup done               | Identity object deletion isn't reversible. Re-create any client, resource server, permission, or role you removed in error                                                                                               |

Roll back before step 6. Once you've deleted Identity objects, recovery is manual.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology
