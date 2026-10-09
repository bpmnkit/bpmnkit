# Upgrade Camunda 8.9 to 8.10 using Helm — Troubleshooting — Custom document store ID

You can't use a non-default `global.documentStore.type.inmemory.storeId` (or `aws`/`gcp`) through the deprecated key alone. The reason is that `global.documentStore.activeStoreId` (the store type) sets the default store ID. The custom store ID never sets it. As a result, the app fails with `Default document store ID does not match any configured document store`.

Migrate the whole document configuration to `camunda.document.*` (`default-store-id` plus the store definition) in `orchestration.extraConfiguration`. The Orchestration Cluster is the only component that chart 15.x configures from `global.documentStore`.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
