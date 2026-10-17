# Enable sharing

The REST API to enable sharing

This API allows users to enable the sharing functionality for all reports and dashboards in Optimize. Note that this setting will be permanently persisted in memory and will take precedence over any other previous configurations (e.g. configuration files).

If sharing had been previously enabled and then disabled, re-enabling sharing will allow users to access previously shared URLs under the same address as before. Calling this endpoint when sharing is already enabled will have no effect.


## Method & HTTP target resource

POST `api/public/share/enable`

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/configuration/enable-sharing
