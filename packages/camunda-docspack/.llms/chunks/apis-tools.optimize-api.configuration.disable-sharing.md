# Disable sharing

The REST API to disable sharing

This API allows users to disable the sharing functionality for all reports and dashboards in Optimize. Note that this setting will be permanently persisted in memory and will take precedence over any other previous configurations (e.g. configuration files).

When sharing is disabled, previously shared URLs will no longer be accessible. Upon re-enabling sharing, the previously shared URLs will work once again under the same address as before. Calling this endpoint when sharing is already disabled will have no effect.


## Method & HTTP target resource

POST `api/public/share/disable`

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/configuration/disable-sharing
