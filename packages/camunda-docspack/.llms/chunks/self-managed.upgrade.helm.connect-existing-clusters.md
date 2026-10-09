# Connect existing Orchestration Clusters to a Camunda 8.10 Hub

Convert existing Camunda 8.7, 8.8, and 8.9 Helm releases into orchestration releases managed by a Camunda 8.10 Hub release, without upgrading the clusters.

Connect Orchestration Clusters you already run on Camunda 8.7, 8.8, or 8.9 to an 8.10 Hub release, keeping each cluster on its current version.

Each existing release becomes an orchestration release in place. Its brokers keep their volumes and process state, and the release stops running its own Management Identity, Console, Web Modeler, and bundled Keycloak, if it has one. Afterwards, the Hub release runs Camunda Hub and Management Identity for every cluster.

This page applies to every identity provider. Where steps differ, they distinguish a Keycloak that Management Identity administers from an external OIDC provider such as Microsoft Entra ID, Okta, or Auth0, which you administer yourself.

Don't combine a minor version upgrade with this move. Upgrade the release to the latest patch of its current minor version first, as described in the [prerequisites](#prerequisites), and upgrade to a later minor version only after the conversion, with the upgrade guide for that version.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/connect-existing-clusters
