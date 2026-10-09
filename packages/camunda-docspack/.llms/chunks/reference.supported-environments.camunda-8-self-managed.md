# Supported environments — Camunda 8 Self-Managed

We recommend running Camunda 8 Self-Managed in a Kubernetes environment. We provide officially supported [Helm charts](https://docs.camunda.io/docs/next/self-managed/setup/overview) for this. See the [installation guide](https://docs.camunda.io/docs/next/self-managed/setup/overview) to learn more about the available installation options.

### Deployment options

With the correct configuration, Camunda 8 Self-Managed can be deployed on any [Certified Kubernetes](https://www.cncf.io/training/certification/software-conformance/#benefits) distribution (cloud or on-premises), and is not tied to a specific Kubernetes version. The Helm chart supports the Kubernetes [official support cycle](https://kubernetes.io/releases/).

The following are tested and supported deployment options for Kubernetes, Docker, and manual installation:

- [Stock Kubernetes](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install)
- [Cloud service providers](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install) [recommended]
  - [Amazon EKS](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/amazon-eks)
  - [Microsoft AKS](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/microsoft-aks)
  - [Google GKE](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/gcp/google-gke)
- [Red Hat OpenShift](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift)
- [Docker](https://docs.camunda.io/docs/next/self-managed/deployment/docker/docker) (`linux/amd64`, `linux/arm64`)
- [Manual](https://docs.camunda.io/docs/next/self-managed/deployment/manual/install)

**Note: Helm chart compatibility**
Ensure the Camunda component versions are compatible with the Helm chart version as defined in the [matrix](https://helm.camunda.io/camunda-platform/version-matrix/).

### Sizing

The [sizing of a Camunda 8 installation](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment) depends on various influencing factors. Ensure to [determine these factors](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment#understanding-influencing-factors), and conduct [benchmarking](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment#running-experiments-and-benchmarks) to validate an appropriate environment size for your test, integration, or production environments.

### Persistent volumes

Camunda supports different types of storage volumes, including block storage and network file systems (NFS).

For details on typical volume usage, refer to these examples:

- [Amazon EKS](https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes#amazon-eks-1)
- [Microsoft AKS](https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes#microsoft-aks)
- [Google GKE](https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes#google-gke)

#### Network File Systems

Camunda guarantees support for Amazon Elastic File System (EFS).

If you want to use another NFS, it must meet these requirements:

- Be POSIX-compliant.
- Never reorder file operations.
- Retry I/O operations across temporary network failures, instead of failing on timeout.
- Do not surface network-related failures in the client process.
- **Only one container may mount the disk in write mode at a time.** Two containers mounting the same disk in write mode could cause data corruption.

#### Performance

Regardless of the type, the network storage volumes you use must meet these requirements:

- They must be capable of **at least 1,000 IOPS**.
- The latency of write/msync operations must be in the **low single digit milliseconds** under normal conditions. Ideally, it's in the order of microseconds.
- The p99 latency must be **lower than 300 milliseconds**.
- They must be SSD-backed. HDD-backed volumes typically sustain only tens to a few hundred IOPS with multi-millisecond seek latency, well below the 1,000 IOPS minimum and single-digit-millisecond latency required for Zeebe, so they are not supported.

### Helm charts version matrix

Camunda Helm chart version `15.x.x` works with Camunda version `8.10.x`. Check the [Helm chart version matrix](https://helm.camunda.io/camunda-platform/version-matrix/) for more details.

---
Source: https://docs.camunda.io/docs/next/reference/supported-environments
