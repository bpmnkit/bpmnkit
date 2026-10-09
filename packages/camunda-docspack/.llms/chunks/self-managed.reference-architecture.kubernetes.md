# Kubernetes deployment overview

Camunda 8 Kubernetes deployment reference architecture home.

This reference architecture provides guidance for deploying Camunda 8 Self-Managed within a Kubernetes cluster. This deployment method is ideal for users who want to leverage the benefits of containerization and self-healing. It supports quick scalability and offers increased resilience through multi-zone deployments.


## Key features

- **Scalability & high availability**: Camunda 8 can scale dynamically to meet demand and supports high-availability configurations.
- **Fault tolerance & resilience**: Deploy Camunda 8 across availability zones or regions to improve fault tolerance and increase uptime for your workflows.

While Kubernetes introduces a steeper learning curve, once configured properly it provides significant benefits—such as self-healing capabilities that automatically restart failed containers and reschedule workloads to maintain availability.

Kubernetes also benefits from a robust ecosystem of [**Cloud Native Computing Foundation (CNCF) projects**](https://www.cncf.io/), enabling seamless integration with tools for monitoring, observability, logging, and security. Solutions like [Prometheus](https://prometheus.io/) and [Grafana](https://grafana.com/) offer comprehensive monitoring, while service meshes like [Istio](https://istio.io/) enhance traffic management and security.

By leveraging this ecosystem, organizations can extend Kubernetes to fit specific operational needs—improving automation, scalability, and visibility across their infrastructure.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes
