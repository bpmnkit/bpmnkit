# Release policy — General availability (GA)

Once features and components are released and considered stable, they become generally available.

Stable features and components are:

- Ready for production use for most users with minimal risk.
- Supported by [L1 Priority-level support](https://camunda.com/services/enterprise-support-guide/) for production use.
- Fully documented.

A release or component is considered stable if it has passed all verification and test stages and can be released to production.


## SaaS provisioning

In Camunda 8 SaaS we differentiate between components that are part of a Camunda 8 cluster (cluster components), and components outside the cluster (non-cluster components).

### Cluster components

A cluster typically consists of the following components:

- [Zeebe](https://docs.camunda.io/docs/next/components/zeebe/zeebe-overview)
- [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction)
- [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/introduction-to-tasklist)
- [Optimize](https://docs.camunda.io/docs/next/components/optimize/what-is-optimize)

You can provision cluster components using one of two channels, following the [Camunda release policy](https://camunda.com/release-policy/).

![Stable and alpha channels when provisioning a cluster](../img/channels.png)

#### Stable channel

You can use the **Stable** channel to access [general availability](#general-availability-ga) features for cluster components.

- Provides the latest feature and patch releases ready for most users at minimal risk.
- Releases follow semantic versioning and can be updated to the next minor or patch release without data loss.
- On the stable channel, all supported minor versions are made available for provisioning.

#### Alpha channel

You can use the **Alpha** channel to access [alpha features](https://docs.camunda.io/docs/next/components/early-access/alpha/alpha-features) and patch releases for cluster components.

- Provides alpha releases to preview and prepare for the next stable release.
- Alpha releases provide a short-term stability point to test new features and give feedback before they are released to the stable channel. Use an alpha release to test the upcoming minor release with your infrastructure.

### Non-cluster components

Non-cluster components include:

- [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/index)
- [Connectors](https://docs.camunda.io/docs/next/components/connectors/introduction)

Non-cluster component versions are released continuously.

- Customers are automatically updated to the latest component version when it is ready for release.
- Admins can [enable alpha features](https://docs.camunda.io/docs/next/components/saas/organization/enable-alpha-features) for non-cluster components in organization settings.

### New Camunda 8 versions

When a new Camunda 8 version is released, we try to provide the new version on our managed service at the same time.

An **Update available** notification is shown in Camunda Hub, recommending that you update to the latest version.

![Camunda Hub with notice to update the cluster in Camunda 8 SaaS](../img/update-console.png)

#### Generation names

The generation naming scheme in Camunda 8 SaaS no longer includes the patch version.

- The naming scheme used for the Camunda 8.5 generations is `Camunda <Major>.<Minor>+gen<N>`, where `N` is incremented with every atomic change to the component version set.

- This decouples the generation name from the particular patch level of the components it contains, as some component versions such as connectors are decoupled from other components.

- You can learn about the particular component patch version changes in the update dialogue to the latest generation available.

#### Update or restart for critical issues

In our managed service, Camunda reserves the right to force update or restart a cluster immediately and without notice in advance if there is a critical security or stability issue.

---
Source: https://docs.camunda.io/docs/next/reference/announcements-release-notes/release-policy
