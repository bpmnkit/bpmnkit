# Partitions — Partition data layout

A partition is a persistent append-only event stream. Initially, a partition is empty. As the first entry is inserted, it takes the place of the first entry. As the second entry comes in and is inserted, it takes the place as the second entry, and so on and so forth. Each entry has a position in the partition which uniquely identifies it.

![partition](assets/partition.png)


## Replication

For fault tolerance, data in a partition is replicated from the **leader** of the partition to its **followers**. Followers are other Zeebe Broker nodes that maintain a copy of the partition without performing event processing.

We recommend an **odd replication factor**, as it ensures high fault-tolerance and availability. **Even replication factors** have no benefit over the previous odd value and are weaker than the next.

For example, a replication factor of four has no benefit over a replication factor of three. A replication factor for four would be weaker than a replication factor of five.

### Roles

A replica which takes part in a partition is assigned a role, which can be one of: `leader`, `follower`, or `inactive`.

**Note**
There are other [Raft specific roles](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering#raft-consensus-and-replication-protocol) which are used as part of the
replication process, but are generally not relevant for the operation of a Zeebe cluster.

As mentioned, replication of a partition is from the **leader** to its **followers**. This means _there can only be one leader for
a partition at any given time_. More generally, a node will a partition role of:

- `leader`: a node which is appending new commands to the stream, and replicating them to the **followers**.
- `follower`: a node which is actively taking part in replication, and which could become a `leader`.
- `inactive`: a node which is still starting, or which has encounted a non-recoverable error.

It can happen that nodes will encounter non-recoverable errors, and will explicitly stop a partition - aka take on an `inactive`
role. Non-recoverable here simply means that it cannot automatically recover by itself - human intervention, for example, may allow
it to recover.

An example would be during a rolling update, it could be that a newer version of a node writes data that is not readable by the
older version, which would cause it to stall. Recovery in this case would consist of restarting the older node so that it can update,
which will let it recover.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/partitions
