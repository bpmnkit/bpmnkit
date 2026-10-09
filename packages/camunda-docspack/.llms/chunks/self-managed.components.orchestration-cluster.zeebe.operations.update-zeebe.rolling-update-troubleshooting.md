# Upgrade Zeebe — Rolling update — Troubleshooting

#### Rolling update is not completing

A rolling update can become stuck due to outside interference such as failing Kubernetes pods.

To recover from this, the upgrade can be forced by not waiting on each broker to become ready and instead directly upgrading all brokers at once.
Assuming you use our Helm charts, this can be done via the following command:

```
$ kubectl delete pod -l app.kubernetes.io/component=zeebe-broker
```

This will recreate all broker pods from scratch, running the new version.
Because the upgrade is no longer rolling and all brokers are shut down at the same time, a short downtime is to be expected.

#### Failed to install partition

If upgraded brokers log the error message `Failed to install partition` and do not become healthy, look for more details to understand if this is caused by the rolling update.

If the error is caused by `Cannot upgrade to or from a pre-release version`, Zeebe detected that either the version you started from or the version you upgraded to is a pre-release version.

This is not permitted because pre-release versions such as alpha releases are considered unstable and do not guarantee compatibility with any other version.

**Note**
If you attempted to upgrade from a minor release to a pre-release or alpha version, it is possible to roll back to the previous version of Zeebe. Note that version rollbacks are not supported in most other instances.

If the log message includes `Snapshot is not compatible with current version`, the rolling update failed and manual recovery is required.

**Note**
This message can also be logged by not yet upgraded brokers, in which case it should resolve itself automatically as soon as the [rolling update completes](#rolling-update-is-not-completing).

The exact scenario is further described in the log message and can be one of the following:

##### Snapshot is not compatible with current version: `SkippedMinorVersion`

This normally occurs when attempting an upgrade from one minor version to a newer one while skipping minor versions in between. For example, upgrading from 8.5 to 8.7 directly without first upgrading to 8.6.

This is not supported and Zeebe refuses to run when detecting this. To recover, you may be able to roll back to the previous version and then upgrade to the next minor version first.

Another much more unlikely cause may be that you upgraded multiple times before Zeebe brokers could take snapshots.

For example, if you first upgrade from 8.5 to 8.6 and then immediately to 8.7, the upgraded brokers running 8.7 may find snapshots taken by 8.5 and refuse to run. You can recover from this manually.

##### Snapshot is not compatible with current version: `PatchDowngrade` or `MinorDowngrade`

These indicate a deliberate version downgrade which Zeebe does not support.
If you mistakenly tried to downgrade either the patch or minor version, you can restore by switching to the original version again.

**Note**
This message may show up during a rolling update on not yet upgraded broker.
In that case, it is caused by upgraded brokers sharing snapshots with not yet upgraded brokers.
This should resolve automatically once the broker is upgraded.

If this persists, you can [force the upgrade](#rolling-update-is-not-completing). Alternatively, it is possible to restart Zeebe with the "skipped" minor version. Note that version rollbacks are not supported in most other instances.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/update-zeebe
