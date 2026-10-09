# Upgrade Camunda 8.9 to 8.10 using Helm — Migrate Web Modeler and Console to Camunda Hub — Migrate document-store cloud credentials (2)

#### Azure

No migration needed for these three components: `global.documentStore.type.azure.*` was never wired into connectors, optimize, or web-modeler-restapi in any chart version - only the document store feature itself (owned by orchestration) reads it.

#### Identity

If you configured Aurora/RDS IAM authentication manually through `identity.env`, keep the datasource override and migrate its ambient AWS configuration. Supply static credentials and `AWS_REGION` through `identity.env` or `identity.envFrom`; for IRSA, annotate `identity.serviceAccount`, or create an EKS Pod Identity association. With either workload identity mode, set `AWS_REGION` only when the database is in a different region than the cluster.

#### Not affected

- **Orchestration** continues to own `global.documentStore.type.*` for the document store feature itself. No change is needed if that is all you use it for.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
