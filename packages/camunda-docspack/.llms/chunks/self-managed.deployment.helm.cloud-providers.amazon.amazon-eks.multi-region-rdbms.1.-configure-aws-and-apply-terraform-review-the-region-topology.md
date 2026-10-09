# Multi-region setup with RDBMS (EKS) — 1. Configure AWS and apply Terraform — Review the region topology

The region slots are declared in [variables.tf](https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/terraform/clusters/variables.tf). Adjust the regions, short names, and CIDR blocks to your environment before applying.

Two variables control the topology, and they are not interchangeable:

| Variable              | Meaning                                                                                                     |
| :-------------------- | :---------------------------------------------------------------------------------------------------------- |
| `regions`             | The full list of region slots the cluster can grow into. A slot contributes a zone once Camunda runs in it. |
| `active_region_count` | How many of those slots are deployed. At least two.                                                         |

This guide follows the path the reference implementation tests: it bootstraps two of the three slots, then adds the third region. Deploying fewer slots than you provision is the supported growth path. The Camunda zone list covers only the deployed slots, so each partition holds all of its replicas at every size. The cluster survives a region loss once three or more slots run. With two slots, losing either zone leaves no majority, and processing stops until the zone returns. A spare slot joins later through the [add-zone procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops#add-a-region), which adds its zone to the running cluster.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
