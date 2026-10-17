# Connect existing Orchestration Clusters to a Camunda 8.10 Hub — Convert an existing release — Step 5: Apply the change

Run `helm upgrade` on the existing release, with the same release name, namespace, and chart version. Wait until every pod is ready.

On the 8.8 and 8.9 charts, the upgrade restarts the brokers, Connectors, and Optimize, because their configuration changes. On the 8.7 chart, it restarts the Zeebe Gateway, Operate, Tasklist, Connectors, and Optimize, and the brokers keep running, because their configuration doesn't change. Brokers that restart do so one at a time with the same volumes, so process state is kept. Optimize, and on chart 8.7 Operate and Tasklist, are unavailable until their new pod is ready. For how each workload restarts and when clients see failed requests, see [step 2 of keep the cluster in place](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology#step-2-convert-the-combined-release-to-an-orchestration-release).

The release's Management Identity, Console, and Web Modeler, and its bundled Keycloak if it has one, stop in this step. The chart doesn't delete the PersistentVolumeClaims of the bundled databases it stops rendering, or any external database.

What job workers and API clients need afterwards depends on what changed:

- If the release moved to a different identity provider, tokens from the old provider are rejected. Clients need the new token URL, client ID, and client secret.
- If the provider stayed the same, clients keep working as long as their tokens carry an audience the cluster accepts. Clients whose audience the cluster no longer accepts get `401 Unauthorized`. See [keep existing clients working](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology#keep-existing-clients-working).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/connect-existing-clusters
