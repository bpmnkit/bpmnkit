# External variable ingestion

The REST API to ingest external variable data into Optimize.

With the external variable ingestion API, variable data held in external systems can be ingested into Optimize directly,
without the need for these variables to be present in your Camunda platform data. This can be useful when external
business data, which is relevant for process analysis in Optimize, is to be associated with specific process instances.

Especially if this data changes over time, it is advisable to use this REST API to persist external variable updates to Optimize, as otherwise Optimize may not be aware of data changes in the external system.

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/external-variable-ingestion
