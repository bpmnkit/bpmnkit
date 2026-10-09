# Kubernetes deployment overview — Cloud specifics — Google GKE

#### Minimum cluster requirements

- Instance type: n(1|2)-standard-4 (4 vCPUs, 15 / 16 GiB memory)
- Number of Kubernetes nodes: 4
- Volume type: Performance (SSD) persistent disks
  - 3,000 IOPS baseline
  - 125 MiB/s throughput baseline
  - On `pd-ssd`, IOPS and throughput scale with disk size, so size the disk to meet the baseline (throughput is the binding constraint). See [GCP disk performance](https://cloud.google.com/compute/docs/disks/performance).
- Unsupported volume types: Standard persistent disks (`pd-standard`, HDD-backed) cannot meet Zeebe's Raft flush latency requirements. Use SSD-backed (`pd-ssd`) volumes.

#### Load balancer

If you are using the [GKE Ingress](https://cloud.google.com/kubernetes-engine/docs/concepts/ingress) (Ingress-gce), you may need to use `cloud.google.com/app-protocols` annotations in the **Zeebe Gateway** service. For more details, visit the GKE guide [using HTTP/2 for load balancing with Ingress](https://cloud.google.com/kubernetes-engine/docs/how-to/ingress-http2).

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes
