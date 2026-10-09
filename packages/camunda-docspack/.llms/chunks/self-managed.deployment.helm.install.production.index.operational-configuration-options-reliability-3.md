# Install Camunda for production with Helm — Operational configuration options — Reliability (3)

<!-- This seems very specific to the application. I might remove this: -->
<!-- - Mount Secrets as volumes, not environment variables -->

#### Resource quotas

It is recommended to set a memory and resource quota for your namespace. Please refer to the [Kubernetes documentation](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/) to do so. Namespace-level quotas apply limits to all workloads within a namespace and ensure aggregate resource consumption by all pods in the namespace does not exceed your desired resource limits.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
