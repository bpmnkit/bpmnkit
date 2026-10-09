# History cleanup — Process data

The age of process instance data is determined by the `endTime` field of each process instance. Running instances are never cleaned up.

To enable the cleanup of process instance data, the `historyCleanup.processDataCleanup.enabled` property needs to be set to `true`.

Another important configuration parameter for process instance cleanup is the `historyCleanup.processDataCleanup.cleanupMode`. It determines what in particular gets deleted when a process instance is cleaned up. The default value of `all` results in the whole process instance being deleted.
For other options, review the [configuration description](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#history-cleanup-settings) of the `historyCleanup.processDataCleanup.cleanupMode` property.

To set up a process definition-specific `ttl` or different `cleanupMode` you can also provide process specific settings using the `perProcessDefinitionConfig` list which overrides the global settings for the corresponding definition key.

In this example, process instances of the key `MyProcessDefinitionKey` would be cleaned up after two months instead of two years, and when the cleanup is performed, only their associated variables would be deleted instead of the complete process instance.

```
historyCleanup:
  ttl: 'P2Y'
  processDataCleanup:
    enabled: true
    cleanupMode: 'all'
    perProcessDefinitionConfig:
      'MyProcessDefinitionKey':
        ttl: 'P2M'
        cleanupMode: 'variables'
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/history-cleanup
