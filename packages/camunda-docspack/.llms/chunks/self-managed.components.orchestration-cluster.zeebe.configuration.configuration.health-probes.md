# Configuration — Health probes

Health probes are set to sensible defaults which cover common use cases.

For specific use cases, it might be necessary to customize health probes:

- [Gateway health probes](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway-health-probes)


## Experimental configuration options

You may have already noticed a special section of Zeebe's configuration templates titled `experimental`.
This section refers to settings which are potentially not backwards compatible. In other words, any configuration setting found there may or may not be dropped in any minor version.

These settings are there primarily for incubating features and/or very advanced settings for which the team has not found
a good general default configuration. Once one is found, or the incubating feature is promoted, the setting(s) may be moved
into a different section. Only at that point do they fall under the same backwards compatibility guarantees as the rest of
the project. We may choose to drop support for specific experimental configurations in any minor version update.

Most users should not have to change anything in this section for a good experience. However, if you have a unique set up, or simply wish to try out new experimental features, it can be worth investigating these (ideally with the guidance of the Zeebe community).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/configuration
