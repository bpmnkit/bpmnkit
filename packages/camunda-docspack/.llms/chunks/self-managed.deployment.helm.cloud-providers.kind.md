# Deploy Camunda 8 to a local kind cluster

Deploy Camunda 8 Self-Managed on a local Kubernetes cluster using kind for development and testing purposes.

With this guide, you'll deploy Camunda 8 Self-Managed to a local Kubernetes cluster using [kind (Kubernetes in Docker)](https://kind.sigs.k8s.io/). The setup is optimized for learning, development, and testing, with reduced resource requirements suitable for a personal machine.

While this guide uses kind, the same concepts apply to other local Kubernetes tools, like [K3s](https://k3s.io/), [minikube](https://minikube.sigs.k8s.io/), or [MicroK8s](https://microk8s.io/).

**Warning: Local development only**
This setup is intended for **local development only** and shouldn't be used in production environments. For production deployments, follow our [cloud provider guides](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/index).

If you encounter issues during deployment, refer to the [Troubleshooting](#troubleshooting) section.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/kind
