# Elasticsearch exporter — Concept

The exporter operates on the idea that it should perform as little as possible on the Zeebe side of things. In other words, you can think of the indexes into which the records are exported as a staging data warehouse. Any enrichment or transformation on the exported data should be performed by your own ETL jobs.

When configured to do so, the exporter will automatically create an index per record value type (see the value type in the Zeebe protocol). Each of these indexes has a corresponding pre-defined mapping to facilitate data ingestion for your own ETL jobs. You can find
those as templates in [the resources folder of the exporter's source code](https://github.com/camunda/camunda/tree/main/zeebe/exporters/elasticsearch-exporter/src/main/resources).

**Note**
The indexes are created as required, and will not be created twice if they already exist. However, once disabled, they will not be deleted (that is up to the administrator.) Similarly, data is never deleted by the exporter, and must be deleted by the administrator when it is safe to do so.
A [retention](#retention) policy can be configured to automatically delete data after a certain number of days.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/elasticsearch-exporter
