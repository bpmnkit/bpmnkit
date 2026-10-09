# History cleanup

Make sure that old data is automatically removed from Optimize.

To satisfy data protection laws or just for general storage management purposes, Optimize provides an automated cleanup functionality.

There are two types of history cleanup:

- Process data cleanup
- External variable cleanup

By default, all types of history cleanup are disabled. They can be enabled individually by config and the cleanup is applied accordingly.


## Setup

The most important settings are `cronTrigger` and `ttl`; their global default configuration is the following:

```
historyCleanup:
  cronTrigger: '0 1 * * *'
  ttl: 'P2Y'
```

`cronTrigger` - defines at what interval and when the history cleanup should be performed in the format of a cron expression. The default is 1AM every day. To avoid any impact on daily business, it is recommended to schedule the cleanup outside of business hours.

See the [Configuration Description](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#history-cleanup-settings) for further insights into this property and its format.

`ttl` - is the global time to live period of data contained in Optimize. The field that defines the age of a particular entity differs between process, decision, and event data. Refer to the corresponding subsection in regard to that.
The default value is `'P2Y'`, which means by default data older than _2 years_ at the point in time when the cleanup is executed gets cleaned up.
For details on the notation, see the [Configuration Description](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#history-cleanup-settings) of the ttl property.

All the remaining settings are entity type specific and will be explained in the following subsections.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/history-cleanup
