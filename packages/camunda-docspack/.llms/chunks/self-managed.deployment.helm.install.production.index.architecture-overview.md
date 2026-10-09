# Install Camunda for production with Helm — Architecture overview

This is the high-level architecture diagram for our production setup, as illustrated below:

<!-- Source: https://miro.com/app/board/uXjVL-6SrPc=/?moveToWidget=3458764665925646201&cot=14 -->

![Architecture Diagram](./img/architecture.jpg)

For more information refer to the Camunda 8 [Kubernetes reference architectures](https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes#kubernetes).

This page describes a single production release. For a new Camunda 8.10 production deployment, the baseline topology deploys Camunda Hub and each Orchestration Cluster as separate Helm releases, with one Optimize release per Physical Tenant. See [Camunda 8.10 deployment topology](https://docs.camunda.io/docs/next/self-managed/reference-architecture/deployment-topology) and [install the deployment topology](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index).

Before you write a production values file, see [Helm and application configuration responsibilities](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configuration-responsibilities) for which settings belong in `values.yaml` and which belong in a component's `extraConfiguration`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
