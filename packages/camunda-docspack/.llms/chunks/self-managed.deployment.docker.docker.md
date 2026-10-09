# Camunda Docker images

Learn about Camunda Docker images, their supported platforms, and recommended production alternatives.

Camunda provides [official Docker images](https://hub.docker.com/u/camunda) for all major components.


## Docker images vs. Docker Compose

Docker images are suitable for production deployments.

By contrast, the provided [Docker Compose files](https://docs.camunda.io/docs/next/self-managed/deployment/quickstart/developer-quickstart/docker-compose) are intended only for quick start, development, and testing.

For production, we recommend using [Kubernetes with Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install). Advanced users can create their own hardened Docker Compose configuration, but this requires additional effort.


## Platform support

- Use the `linux/amd64` or `linux/arm64` image for production environments.
- All images are publicly accessible.

Docker images are supported for production only on Linux systems.
Windows and macOS are supported for development environments only.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/docker/docker
