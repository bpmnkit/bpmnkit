# Deploy required dependencies with Kubernetes operators — Prerequisites

Before proceeding with this guide, ensure you have:

- **Kubernetes cluster**: A functioning cluster with `kubectl` access and block-storage persistent volumes
- **Cluster admin privileges**: Required to install Custom Resource Definitions (CRDs) and operators
- **Command-line tools**:
  - `kubectl` configured to access your cluster
  - `helm` CLI for deploying Camunda using the Helm chart
  - `openssl` for generating random passwords
  - `envsubst` command (part of `gettext` package) for environment variable substitution


## Architecture overview

This deployment approach separates infrastructure management from application deployment:

<!-- Source: https://miro.com/app/board/uXjVL-6SrPc=/?moveToWidget=3458764643761312188&cot=14 -->

![Operator-based infrastructure architecture](assets/vendor-components-arch.jpg)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
