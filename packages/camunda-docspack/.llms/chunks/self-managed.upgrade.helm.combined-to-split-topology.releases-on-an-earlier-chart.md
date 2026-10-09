# Move from a combined release to the split topology — Releases on an earlier chart

This procedure needs the 8.10 chart for every release. Don't use it for a release on the 8.7, 8.8, or 8.9 chart:

- The Hub release would take over that release's Management Identity and Web Modeler databases. From 8.7 or 8.8, that skips minor versions.
- Step 2 and step 5 move Optimize to its own release. The `optimize` role needs the 8.10 chart. The 8.7, 8.8, and 8.9 charts accept only the `combined` and `orchestration` roles.
- Step 2 removes the release's bundled Keycloak, because the `orchestration` role doesn't allow it on those charts. A release that uses its bundled Keycloak loses its identity provider.

To put a release on an earlier chart under a Hub, it needs an identity provider outside the release. Install the Hub release with its own databases, then follow [connect existing clusters to Hub](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/connect-existing-clusters).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology
