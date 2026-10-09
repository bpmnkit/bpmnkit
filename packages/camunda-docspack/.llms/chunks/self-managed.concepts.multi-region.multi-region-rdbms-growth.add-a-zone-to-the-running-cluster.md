# Grow a Multi-Region RDBMS cluster — Add a zone to the running cluster

1. Start the brokers of the new zone.
1. Add the zone with the [Add or re-add a zone](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#add-or-re-add-a-zone) request. The request body needs `numberOfReplicas`, `priority`, and either `numberOfBrokers` or `brokers`.
1. Wait for the change to report `COMPLETED`. Follow it with the [Monitoring API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#monitoring-api).

The engine places the zone's replicas and raises the replication factor in one change. No broker is renumbered, and the regions already running aren't restarted.

| Zones running | Layout  | Replication factor | After losing one zone                                 |
| :------------ | :------ | :----------------- | :---------------------------------------------------- |
| Two           | `2-2`   | 4                  | Two of four replicas: processing stops                |
| Three         | `2-2-1` | 5                  | Three of five replicas at worst: processing continues |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms-growth
