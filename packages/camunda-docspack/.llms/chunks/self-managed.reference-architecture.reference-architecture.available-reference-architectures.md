# Camunda 8 reference architectures — Available reference architectures

Choose a reference architecture based on factors such as your organization’s goals, infrastructure, and requirements. Use the following guides to plan your deployment:

### Kubernetes

Kubernetes is a powerful orchestration platform for containerized applications. A Kubernetes reference architecture provides guidelines for setting up clusters, managing workloads, and ensuring high availability and scalability.

- Ideal for organizations adopting containerization and microservices (see [Cloud Native Computing Foundation](https://www.cncf.io/)).
- Suitable for dynamic scaling and high availability.
- Best for teams experienced in managing containerized environments.
- Offers high resilience but comes with a steep learning curve.

See [Kubernetes deployment overview](https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes).

### Containers

Containers, such as Docker, provide a portable and consistent runtime environment. They simplify development, testing, and deployment across environments by encapsulating applications and their dependencies.

- A middle ground between manual setups and Kubernetes that provides the benefits of containerization without the overhead of Kubernetes.
- Containers can run on any system that supports the container runtime, ensuring consistency across development, testing, and production environments.
- Each container runs in its own isolated environment, which helps prevent conflicts between applications and improves security.
- Containers can be easily scaled up or down to handle varying workloads, providing flexibility in resource management.

See [Camunda Docker images](https://docs.camunda.io/docs/next/self-managed/deployment/docker/docker).

### Manual (bare metal/virtual machines)

For organizations that prefer traditional infrastructure, bare metal or VM-based reference architectures offer a structured approach to system deployment. These architectures provide best practices for setting up physical servers or VMs, configuring networks, and managing storage using Infrastructure as Service cloud providers. They are suitable for environments where containerization or use of Kubernetes services may not be feasible.

- Suitable for IaaS, bare metal, or traditional infrastructures.
- Ideal for traditional setups needing highly customized security, strict data residency, or industry-specific regulatory compliance.
- Applicable for high availability but requires more detailed planning.
- Best for teams with expertise in managing physical servers or virtual machines.

See [Manual deployment overview](https://docs.camunda.io/docs/next/self-managed/reference-architecture/manual).

### Local development

For local evaluation or development, use [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run), a simplified distribution for developers.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture
