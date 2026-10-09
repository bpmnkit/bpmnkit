# Move from a combined release to the split topology — Verify the move

- Every pod is ready in all three releases.
- Camunda Hub lists the Orchestration Cluster, and it reports healthy.
- Deploying a process through Hub reaches the cluster.
- Existing process instances are still visible in Operate, and workers still poll and complete jobs.
- Optimize shows process data, which confirms its reader prefix matches the exporter writer prefix.
- Only one Management Identity is running, in the Hub release.
- No release logs authentication errors against an OIDC client that no longer exists.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology
