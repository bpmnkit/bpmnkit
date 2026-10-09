# Move from a combined release to the split topology — Keep the cluster in place — Step 6: Clean up

- Confirm no workload still resolves the old in-release Management Identity or Hub service names.
- Inventory the OIDC clients, resource servers, permissions, and roles. Identity initialization is additive, so the combined release's objects still exist. Remove only what no release uses.
- Retire the old Hub hostname and its TLS certificate, or redirect it.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology
