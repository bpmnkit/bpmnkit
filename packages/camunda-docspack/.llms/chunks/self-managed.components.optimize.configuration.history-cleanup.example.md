# History cleanup — Example

Here is an example of what a complete cleanup configuration might look like:

```
historyCleanup:
  cronTrigger: '0 1 * * 0'
  ttl: 'P1Y'
  processDataCleanup:
    enabled: true
    cleanupMode: 'variables'
    perProcessDefinitionConfig:
      'VeryConfidentProcess':
        ttl: 'P1M'
        cleanupMode: 'all'
      'KeepTwoMonthsProcess':
        ttl: 'P2M'
```

The above configuration results in the following setup:

- The cleanup is scheduled to run every Sunday at 1AM.
- The global `ttl` of any data is one year.
- The process data cleanup is enabled.
- The `cleanupMode` performed on all process instances that passed the `ttl` period is just clearing their variable data but keeping the overall instance data like activityInstances.
- There is a process specific setup for the process definition key `'VeryConfidentProcess'` that has a special `ttl` of one month and those will be deleted completely due the specific `cleanupMode: 'all'` configuration for them.
- There is another process specific setup for the process definition key `'KeepTwoMonthsProcess'` that has a special `ttl` of two months.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/history-cleanup
