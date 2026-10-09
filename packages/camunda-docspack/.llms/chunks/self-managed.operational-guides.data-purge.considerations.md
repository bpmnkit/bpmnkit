# Camunda data purge — Considerations

### 1. DryRun

You can set the `dryRun` parameter to `true` to simulate the purge operation without deleting any data. This can be useful to understand the impact of the operation before proceeding.

```sh
curl -X POST 'http://localhost:9600/actuator/cluster/purge?dryRun=true'
```

### 2. Don't perform the purge operation during other cluster operations

You cannot perform the purge operation if another cluster operation is already in progress (for example, scaling).

Similarly, you cannot perform other cluster operations while the purge operation is in progress.


## Troubleshooting

The data purge operation is idempotent, meaning you can retry the operation if it fails.

### 409 - ConcurrentChangeError

The `409 - ConcurrentChangeError` response means another cluster operation is already in progress. Wait for the current operation to complete before retrying the purge operation.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/data-purge
