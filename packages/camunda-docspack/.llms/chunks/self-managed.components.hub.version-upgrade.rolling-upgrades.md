# Version upgrade — Rolling upgrades

Camunda Hub database migrations are often backward compatible, meaning an old application version can temporarily continue working with the new database schema. Because of this, you can perform a rolling upgrade, where multiple instances of Hub are running in parallel and they migrate to the new version one after the other. With this strategy, instances continue serving traffic at all times.

The [component upgrade guide](https://docs.camunda.io/docs/next/self-managed/upgrade/components/index) informs whether the Hub upgrade between two specific minor versions requires downtime or can be performed in a rolling fashion. Review the guide before performing an upgrade between minor versions. If your upgrade spans multiple minor versions, consult the guide for all minor versions. For example, if you upgrade from version 8.8 to 8.10, read the upgrade guide from version 8.8 to 8.9 and the guide from version 8.9 to 8.10.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/version-upgrade
