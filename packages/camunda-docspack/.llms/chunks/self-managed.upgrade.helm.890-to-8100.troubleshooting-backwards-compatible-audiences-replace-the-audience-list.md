# Upgrade Camunda 8.9 to 8.10 using Helm — Troubleshooting — Backwards-compatible audiences replace the audience list

The deprecated `orchestration.security.authentication.oidc.backwardsCompatibleAudiences` appended its values to the default audiences. However, its target, `camunda.security.authentication.oidc.audiences`, replaces the whole list. If you migrate the key verbatim, the Orchestration Cluster accepts only your extra audience and rejects tokens for the default audiences. The gRPC API reports this rejection as `UNAUTHENTICATED: Invalid bearer token`.

The chart's default audiences are `orchestration` (the client ID) and `orchestration-api`. When you enable Camunda Hub, the default audiences also include `web-modeler-api`. List the default audiences alongside your backwards-compatible audience in `audiences`.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
