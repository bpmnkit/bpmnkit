# Upgrade Zeebe — Rolling update

A **rolling update** ensures the Zeebe cluster stays available by upgrading brokers and gateways one by one instead of all at once.

There are three parts to a rolling update: the Zeebe Broker, Zeebe Gateway, and clients.

We recommend upgrading brokers first, then gateways, and finally clients. This ensures clients don't use new APIs that are not yet supported by the brokers or gateways.

Because Zeebe is backwards compatible with the previous minor version, upgrading gateways and clients is not strictly necessary and can happen any time after upgrading the brokers.

While upgrading brokers, leadership for partitions will rotate which may cause brief unavailability or loss of performance on the affected partitions.

The procedure to do a rolling update of Zeebe brokers is the following:

1. Pick the broker with the highest ID that runs the old version.
2. Shut down the broker.
3. Upgrade the broker software to the new version.
4. Start the broker and wait for it to become ready and healthy.
5. Repeat until all brokers are upgraded.

Gateways are upgraded with the same procedure, upgrading each replica one by one.

Clients can be upgraded according to your requirements and environment, for example by simply deploying a new version of your worker applications.

For disaster recovery, you may want to take [backups](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore) before the upgrade.

If you plan to immediately upgrade again, wait to give all brokers a chance to take new snapshots.
The snapshot period is five minutes by default but is [configurable via `snapshotPeriod`](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#zeebebrokerdata).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/update-zeebe
