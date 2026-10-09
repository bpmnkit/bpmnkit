# Zone-aware clusters — How zone awareness works

You assign each broker to a zone through the `camunda.cluster.zone` setting. Internally, brokers are identified by a composite node ID of the form `<zone>_<index>`, combining the zone name and the broker's index within that zone. For a two-broker `us-east1` zone and a two-broker `us-west1` zone, the brokers are named:

```text
us-east1_0
us-east1_1
us-west1_0
us-west1_1
```

The zone is part of the name, so you can read the topology directly from the broker identifiers. Zone names are not reserved for three or more zones: a single-region or dual-region cluster can use them too, and gets the same readable identities. Numeric node IDs remain available for existing setups.

### Partitioning scheme

The `ZONE_AWARE` partitioning scheme drives partition distribution and leadership. When you select this scheme, you describe every zone in the cluster as a list, giving each zone the following properties:

| Property             | Description                                                                                     |
| :------------------- | :---------------------------------------------------------------------------------------------- |
| `name`               | The zone identifier. Must match the `camunda.cluster.zone` of the brokers in that zone.         |
| `number-of-brokers`  | How many brokers are deployed in the zone.                                                      |
| `number-of-replicas` | How many replicas of each replication group live in the zone.                                   |
| `priority`           | Higher values give the zone higher Raft election priority, biasing partition leaders toward it. |

### Comparison to dual-region broker numbering

In the [dual-region](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region) setup, brokers are numbered `0, 1, 2, 3, …` and the region is inferred from the parity of the node ID: even IDs (`0, 2, 4, …`) belong to one region and odd IDs (`1, 3, 5, …`) to the other. This parity-based approach only works for exactly two regions and hides the region in the numbering.

Zone awareness replaces it with explicit zone names, which works for any number of zones. Changing the zone list afterwards is possible, but it is not a configuration-only change: existing partitions have to be told about the new zone through the [cluster management API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#add-or-re-add-a-zone).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/zone-aware-clusters
