# Move from a combined release to the split topology — Keep the cluster in place — Step 2: Convert the combined release to an orchestration release

Update the existing release's values:

- Set `global.topology.mode: orchestration`. The role stops rendering Management Identity and Camunda Hub, so the combined release's Management Identity stops in this step.
- Set `identity.enabled: false`.
- Set `global.identity.service.url` to the Management Identity service the Hub release creates in step 3, in the Hub namespace.
- To run Optimize as its own release, set `optimize.enabled: false`. The `orchestration` role doesn't do this for you. The chart then stops rendering the legacy exporter Optimize reads, so enable it explicitly with the same writer prefix in the same `helm upgrade`. Optimize is unavailable from this step until its own release is running in step 5. To keep Optimize in this release instead, leave it enabled and skip step 5. See [export records for Optimize](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release#export-records-for-optimize).
- Keep the release name, namespace, `orchestration.*` values, secondary storage configuration, and every index prefix unchanged.

Run `helm upgrade` on the existing release, without changing its name or namespace. The Orchestration Cluster StatefulSet is preserved, so the brokers keep their volumes and their identity.

**Warning**
Verify with `helm template` or `helm diff` before you apply this step. Confirm the rendered output still contains the Orchestration Cluster StatefulSet with the same name, and the same `volumeClaimTemplates`, and no Management Identity Deployment. If the StatefulSet is absent or renamed, stop: applying it will detach your brokers from their storage.

Before you continue, confirm the combined release's Management Identity pods have terminated.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology
