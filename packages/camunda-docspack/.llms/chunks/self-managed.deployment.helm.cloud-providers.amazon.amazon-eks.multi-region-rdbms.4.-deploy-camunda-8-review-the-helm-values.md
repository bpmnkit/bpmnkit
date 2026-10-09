# Multi-region setup with RDBMS (EKS) — 4. Deploy Camunda 8 — Review the Helm values

The values file is the same in every region. Only `orchestration.partitioning.zone` and the advertised host differ, so one file describes the whole topology.

See the full camunda-values.yml
```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/helm-values/camunda-values.yml
```

The parts worth reading before you install:

- `orchestration.partitioning.scheme: zone-aware` selects [zone-aware partitioning](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/zone-aware-clusters). The chart rejects `numberOfZones` and `zoneIndex` with this scheme, because the zone list describes the topology instead. The chart derives the cluster size, replication factor, and broker node IDs from that list. See [configure zone-aware multi-region deployments](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/multi-region-zone-awareness).
- `orchestration.partitioning.zones` lists every running zone with its broker count, replica count, and priority. Zone 0 has the highest priority because it hosts the database writer.
- `orchestration.data.secondaryStorage.type: rdbms` with a single `url` shared by every broker in every region.
- The AWS Advanced JDBC Wrapper uses `initialConnection,failover`. `initialConnection` discovers the current writer when a broker starts after a switchover. `failover` follows a writer change on an established connection.
- `CAMUNDA_DATA_SECONDARYSTORAGE_RDBMS_ASYNCREPLICATION_ENABLED: "true"` is required. Without it the exporter acknowledges records the standby has not received, and a writer failover loses exported data.
- The reference architecture also pins `CAMUNDA_DATA_SECONDARYSTORAGE_RDBMS_ASYNCREPLICATION_TYPE: LOG_SEQ`, `CAMUNDA_DATA_SECONDARYSTORAGE_RDBMS_ASYNCREPLICATION_MAXLAG: PT1H`, and `CAMUNDA_DATA_SECONDARYSTORAGE_RDBMS_ASYNCREPLICATION_PAUSEONMAXLAGEXCEEDED: "false"`. The first two set a strategy and a lag budget. The third keeps the engine default, because pausing stops exporting. Enable pausing only on purpose. The lag budget has no effect until you enable pausing. The engine compares it only inside the pause condition.
- Cross-region SWIM membership timeouts are relaxed. The defaults are tuned for intra-region latency, and on a cold start brokers otherwise see remote peers as unreachable, eject them, and never converge.
- `identity`, `console`, and `optimize` are disabled. See [limitations](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms#limitations).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
