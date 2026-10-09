# Connect existing Orchestration Clusters to a Camunda 8.10 Hub — Convert an existing release — Step 4: Check the rendered change

Render the change with `helm template` or `helm diff` before you apply it, using the release's current chart version.

**Warning**
Confirm the rendered output still contains the broker StatefulSet, `<release>-zeebe`, with the same name and the same `volumeClaimTemplates`. If the StatefulSet is missing or renamed, stop: applying the change would detach the brokers from their storage.

Also confirm the output contains no Management Identity, bundled Keycloak, Console, or Web Modeler workload, and no bundled PostgreSQL StatefulSet.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/connect-existing-clusters
