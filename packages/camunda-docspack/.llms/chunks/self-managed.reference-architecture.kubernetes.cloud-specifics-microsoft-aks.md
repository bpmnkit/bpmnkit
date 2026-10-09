# Kubernetes deployment overview — Cloud specifics — Microsoft AKS

#### Minimum cluster requirements

- Instance type: Standard_D4as_v4 (4 vCPUs, 16 GiB memory)
- Number of Kubernetes nodes: 4
- Volume type: Premium SSD v2
  - 3,000 IOPS baseline
  - 125 MiB/s throughput baseline
  - Several [known limitations](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-types#premium-ssd-v2-limitations), e.g., lack of [Azure Backup support](https://learn.microsoft.com/en-us/azure/backup/disk-backup-support-matrix#limitations)
- Volume alternative: Premium SSD
  - Performance [varies based on volume size](https://learn.microsoft.com/en-us/azure/virtual-machines/disks-types#premium-ssds); size the disk to sustain the target IOPS and throughput baseline
- Unsupported volume types: Standard HDD is not supported.
- Volume alternative caveat: Standard SSD is supported if sized to sustain the target IOPS and throughput continuously without relying on bursting.

#### Load balancer

Azure offers the **Application Gateway for Containers (AGC)**, which supports gRPC and HTTP/2 via the `GRPCRoute` resource in the [Kubernetes Gateway API](https://kubernetes.io/docs/concepts/services-networking/gateway/). Configuration details are available in the [official Azure documentation](https://learn.microsoft.com/en-us/azure/application-gateway/for-containers/grpc).

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes
