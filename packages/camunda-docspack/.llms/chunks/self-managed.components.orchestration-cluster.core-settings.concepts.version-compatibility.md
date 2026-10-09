# Version compatibility checks

How Camunda 8 validates version compatibility during upgrades (broker and secondary storage).

This page describes how Camunda 8 validates version compatibility when you upgrade a Self-Managed Orchestration Cluster. It covers:

- What defines a compatible or incompatible upgrade path
- How the **broker** enforces version rules
- How **secondary storage management** performs similar checks


## Semantic version basics

Camunda 8 versions follow the `MAJOR.MINOR.PATCH` format (for example, `8.8.3`). Early access builds include a pre-release suffix (for example, `8.8.0-alpha1`).

- **Major**: No cross-major upgrades or downgrades are supported directly.
- **Minor**: Feature releases. You must move only one minor step at a time and follow the required upgrade procedure described below.
- **Patch**: Bug or security fixes. You can move forward within the same minor (for example, `8.8.1 → 8.8.3`).
- **Pre-release (alpha)**: Builds tagged with `-alpha*` are not valid endpoints in a supported upgrade path.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/version-compatibility
