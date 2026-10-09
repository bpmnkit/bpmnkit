# Kubernetes deployment overview — Architecture — Kubernetes

A production deployment is recommended. For more information, see the [production deployment guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index) and the [components](#components) section.

The following visuals provide a simplified view of the deployed namespaces using the [Camunda 8 Helm chart](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install). For clarity, ConfigMaps, Secrets, RBAC, and ReplicaSets are omitted.

#### Management plane

![Camunda Hub and Management Identity](./img/management-cluster.jpg)

Camunda Hub and Management Identity form the management plane, which serves all Orchestration Clusters in the deployment. Both are stateless and deployed as **Deployments**, with data stored in an external SQL database. This makes it easy to scale each horizontally by running multiple replica pods behind a load balancer, improving availability and request throughput.

Each namespace uses its own Ingress, as Ingress resources are namespace-scoped (not cluster-wide). This requires separate subdomains for each Ingress. For more details, see the [production deployment guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index).

#### Orchestration Cluster

![Orchestration Cluster](./img/k8s-cluster-view-orchestration.jpg)

The Helm chart uses a single Ingress by default, enabling a unified domain with each application accessible via a dedicated path.

Most Camunda 8 components are stateless and deployed as **Deployments**. However, the Orchestration Cluster contains Zeebe brokers, which require a **StatefulSet** to maintain consistent volume mounts. This ensures stable pod ordering and identifiers. StatefulSet names remain consistent even as they represent the entire Orchestration Cluster—simplifying migration from existing setups.

The Orchestration Cluster exposes two services:

1. A [**headless service**](https://kubernetes.io/docs/concepts/services-networking/service/#headless-services) for internal communication between Zeebe brokers. This service skips load balancing and resolves to pod IPs for direct peer-to-peer communication.

2. A **standard service** for external applications. This service distributes traffic randomly (via `kube-proxy`) and is suitable for clients or other services connecting to the cluster.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes
