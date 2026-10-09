# Kubernetes deployment overview — Distributions

### OpenShift

Red Hat OpenShift, a Kubernetes distribution maintained by [Red Hat](https://www.redhat.com/en/technologies/cloud-computing/openshift), provides options for both managed and on-premises hosting.

#### Minimum cluster requirements

- Instance type: 4 vCPUs (x86_64, >3.1 GHz), 16 GiB memory
- Number of dedicated nodes: 4
- Volume type: SSD
  - 3,000 IOPS baseline per volume
  - 125 MiB/s throughput baseline per volume
- Unsupported volume types: HDD-backed volumes are not supported.

#### Supported versions

As stated in the general [supported environments](https://docs.camunda.io/docs/next/reference/supported-environments) policy, Camunda 8 Self-Managed runs on any [certified Kubernetes](https://www.cncf.io/training/certification/software-conformance/) distribution. For OpenShift specifically, this means any release in the Red Hat **General Availability**, **Full Support**, or **Maintenance Support** lifecycle phases (see the [Red Hat OpenShift Container Platform Life Cycle Policy](https://access.redhat.com/support/policy/updates/openshift)), within the upstream [Kubernetes version skew policy](https://kubernetes.io/releases/version-skew-policy/).

Our reference architectures are continuously validated against the latest stable OpenShift release available in Red Hat's GA channel. Newly released OpenShift minor versions are evaluated and validated shortly after their GA.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes
