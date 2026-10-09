# Multi-region setup with RDBMS (EKS) — Topology

The default topology provisions three region slots. The table shows the cluster after you add the third region. While two regions run, the cluster has four brokers and a replication factor of four.

| Setting                             | Default                                  | Meaning                                                         |
| :---------------------------------- | :--------------------------------------- | :-------------------------------------------------------------- |
| Regions                             | `eu-west-2`, `eu-west-3`, `eu-central-2` | London, Paris, Zurich                                           |
| Zone names                          | `london`, `paris`, `zurich`              | One zone per region                                             |
| `orchestration.partitioning.scheme` | `zone-aware`                             | Zone-aware partitioning                                         |
| `numberOfBrokers` per zone          | `2`                                      | Brokers deployed in that zone                                   |
| `numberOfReplicas` per zone         | `2`, `2`, `1`                            | Two in each database region, one in the tie-breaker             |
| `orchestration.clusterSize`         | `6`                                      | Sum of `numberOfBrokers` across zones. The zone list derives it |
| Replication factor                  | `5`                                      | Sum of `numberOfReplicas` across zones                          |
| `orchestration.partitionCount`      | `6`                                      | One partition per broker                                        |
| Database regions                    | Slots `0` and `1`                        | Aurora members, writer first                                    |

Each broker has the name `<zone>_<index>`, so `paris_1` is the second broker in the Paris zone. The zone list is identical in every region, as the [values section](#review-the-helm-values) shows.

### CIDR allocation

Every region owns a distinct VPC range and a distinct Kubernetes service range. Both are routed over the Transit Gateway:

| Slot | Region         | VPC and pod CIDR | Kubernetes service CIDR |
| :--- | :------------- | :--------------- | :---------------------- |
| 0    | `eu-west-2`    | `10.192.0.0/16`  | `10.190.0.0/16`         |
| 1    | `eu-west-3`    | `10.202.0.0/16`  | `10.200.0.0/16`         |
| 2    | `eu-central-2` | `10.212.0.0/16`  | `10.210.0.0/16`         |

A fourth slot (`eu-south-1`, VPC `10.222.0.0/16`, service CIDR `10.220.0.0/16`) is prepared but disabled. Enable it in `variables.tf` before you bootstrap the cluster.

There is no separate pod range. With the [AWS VPC CNI](https://docs.aws.amazon.com/eks/latest/userguide/pod-networking.html), pod IPs are VPC addresses. The Transit Gateway routes VPC CIDRs to enable cross-region pod-to-pod traffic. The connectivity check verifies reachability using the per-pod DNS records that Zeebe brokers dial; it does not test remote ClusterIP access. Service CIDRs are also routed in this reference topology.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
