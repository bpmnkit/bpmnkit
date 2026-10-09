# Version compatibility checks — Required upgrade procedure

All minor version upgrades in a Self-Managed Orchestration Cluster must follow this procedure:

1. **Upgrade to the latest patch version of your current minor.** For example, before upgrading from `8.7.x` to `8.8.y`, first upgrade to the latest `8.7` patch. This is strongly recommended for fix coverage. The compatibility check itself compares minor versions, so any patch of the source minor is accepted. Skipping this step can still expose you to bugs already fixed in later patches.

2. **Upgrade to the next minor version.** Do not skip minor versions. For example, `8.7.x → 8.8.y` is supported, but `8.6.x → 8.8.y` is not. This rule is enforced: skipping a minor fails the compatibility check and blocks startup.

3. After reaching the target minor, **upgrade to the latest patch version of the target minor.** For example, after upgrading to `8.8.0`, update to the latest `8.8` patch.

You can execute this procedure across multiple validation environments (for example, dev → test → stage → prod) before production rollout.

You must not:

- Skip minor versions.
- Downgrade minor or major versions.
- Include pre-release (`-alpha*`) versions in an upgrade chain.

Failure to follow these rules results in an unsupported upgrade path. The broker or schema manager will block startup to prevent unsafe migrations.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/version-compatibility
