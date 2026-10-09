# Enable or disable variable import

Learn how to enable or disable variable import in Camunda Optimize.

Learn how to configure Camunda Optimize to control variable import and enhance performance.


## Overview

By default, Camunda Optimize imports process variables to provide deep insights into both process performance and business context. However, in high-throughput environments or data-sensitive scenarios, importing variables may impact system performance and resource usage.

Variable import affects several areas of Optimize’s operation:

- **Import performance**: Importing large or numerous variables can slow down data import.
- **Memory usage**: Variable data increases memory consumption during processing.
- **Storage requirements**: Imported variables contribute to overall storage demands.
- **Indexing duration**: Additional variable data extends indexing time.

If your organization primarily focuses on process performance metrics rather than detailed business context, disabling variable import can help improve scalability and responsiveness.

**Note**
Variable import controls what Optimize **imports** from already-exported data. To reduce what the broker **exports** in the first place (by variable name, type, BPMN process, or Optimize mode), use the [exporter-side filters](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8#exporter-side-filters-and-optimize-data-completeness). See [impact of Optimize](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment#impact-of-optimize) for guidance on sizing considerations and when to reduce Optimize data volume.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/variable-import
