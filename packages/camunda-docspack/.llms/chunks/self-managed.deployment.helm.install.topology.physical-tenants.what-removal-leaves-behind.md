# Configure Physical Tenants across releases — What removal leaves behind

Identity and Keycloak initialization is additive. Removing or disabling a cluster or tenant record doesn't delete its client, resource server, permissions, or role. Inventory and clean those objects explicitly after dependent releases have stopped. Don't delete an object still used by another release.

Helm uninstall also leaves Elasticsearch and OpenSearch indices intact. This permits re-enabling a tenant with the same prefixes, but it can expose old data to a newly mapped tenant if prefixes are reused. Apply your storage system's retention and deletion process separately, after confirming no release reads or writes those indices.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants
