# Optimize export filtering — Trade-offs

Filtered data is permanently unavailable in Optimize:

- **Process filtering:** Excluded processes don't appear in Optimize reports. If you later re-enable a process, Optimize shows a permanent gap for the period when it was excluded, because records from that window were never exported.
- **Variable filtering:** Filtered variables are unavailable in Optimize reports, including variable filters, variable-based grouping, and raw-data variable columns.

For guidance on non-retroactivity, changing filters on running clusters, and safely applying filters mid-stream, see [Camunda 8 system configuration](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8#exporter-side-filters-and-optimize-data-completeness).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/optimize-export-filtering
