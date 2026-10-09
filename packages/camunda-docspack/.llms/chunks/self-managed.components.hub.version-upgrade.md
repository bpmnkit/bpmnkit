# Version upgrade

The principles of how the Camunda Hub (Self-Managed) application upgrades between versions.

Learn how Camunda Hub upgrades from one version to another.


## About

For a single instance of the Hub application, a version upgrade—whether between patch or minor versions—involves the following steps:

1. The current version stops.
2. The new version starts.
3. The new version applies any migrations to the database schema.
4. HTTP traffic and background operations resume; the Hub application is fully functional again.

For practical guidance on how to perform a Camunda version upgrade, consult the [upgrade guide](https://docs.camunda.io/docs/next/self-managed/upgrade/index).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/version-upgrade
