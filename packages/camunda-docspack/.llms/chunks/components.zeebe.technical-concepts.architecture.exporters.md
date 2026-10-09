# Architecture — Exporters

The exporter system provides an event stream of state changes within Zeebe. This data has many potential uses, including but not limited to:

- Monitoring the current state of running process instances
- Analysis of historic process data for auditing, business intelligence, etc.
- Tracking [incidents](https://docs.camunda.io/docs/next/components/concepts/incidents) created by Zeebe

The exporter includes an API you can use to stream data into a storage system of your choice. Zeebe includes an out-of-the-box [Elasticsearch exporter](https://github.com/camunda/camunda/tree/main/zeebe/exporters/elasticsearch-exporter), and other [community-contributed exporters](https://github.com/camunda-community-hub/awesome-camunda-platform-8) are also available.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/architecture
