# Connect existing Orchestration Clusters to a Camunda 8.10 Hub — Convert an existing release — Step 3: Update the release's values (2)

Whether the release's client IDs change depends on the chart:

- On the 8.8 and 8.9 charts, the record can reuse the release's `orchestration` client ID and `orchestration-api` audience, if no other record uses them. If the release also keeps its identity provider, existing clients then keep working. A release that moves off its bundled Keycloak loses the clients that Keycloak held, so its clients need new credentials either way. See step 5. If the record uses new IDs, keep accepting the old audience. See [keep existing clients working](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology#keep-existing-clients-working).
- On the 8.7 chart, the client IDs always change, because the release's separate `zeebe`, `operate`, and `tasklist` clients become the record's one orchestration client.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/connect-existing-clusters
