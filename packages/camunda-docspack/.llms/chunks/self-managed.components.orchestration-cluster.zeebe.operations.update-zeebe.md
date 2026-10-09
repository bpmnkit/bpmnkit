# Upgrade Zeebe

This section describes how to upgrade Zeebe to a new version.

Zeebe versions can be upgraded:

- From any patch version to a newer patch of the same minor version
- To any patch of the next minor version.

Since Zeebe 8.5, upgrades to a newer version can be rolling or offline. Zeebe 8.4 and older don't contain necessary safety checks that make rolling upgrades safe, and we recommend offline upgrades instead to ensure processing behaves correctly.

**Info**
Review the [upgrade guide](https://docs.camunda.io/docs/next/self-managed/upgrade/components/index) for general upgrade procedures you must follow and to check for known issues relating to the specific upgrade you are planning.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/update-zeebe
