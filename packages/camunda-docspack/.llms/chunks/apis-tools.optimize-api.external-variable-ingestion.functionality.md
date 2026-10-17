# External variable ingestion — Functionality

The external variable ingestion API allows users to ingest batches of variable data which Optimize stores in a dedicated
index. All variable data includes a reference to the process instance each variable belongs to, this reference then
enables Optimize to import external variable data from the dedicated index to their respective process instances at
regular intervals. Once Optimize has updated the process instance data, the external variables are available for report
evaluations in Optimize.


## Limitations

Note that external variables should be treated as separate from engine variables. If you ingest variables that are already present in the engine, engine imports may override the ingested data and vice versa, leading to unreliable report results.

Similarly, if the same ingested batch contains variables with duplicate IDs, you may experience unexpected report results because Optimize will assume only one of the updates per ID and batch to be the most up to date one.

Additionally, ensure the reference information (process instance ID and process definition key) is accurate, as otherwise Optimize will not be able to correctly associate variables with instance data and may create new instance indices, resulting in data which will not be usable in reports. External variables can only be ingested for process instances and will not be affected by any configured variable plugin.

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/external-variable-ingestion
