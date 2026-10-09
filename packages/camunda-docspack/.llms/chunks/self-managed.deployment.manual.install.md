# Camunda manual installation

This page guides you through the manual installation of Camunda 8 on a local machine, bare metal server, or virtual machine.


## Prerequisites

- Bare metal or virtual machine
  - Operating system:
    - Linux
    - Windows, macOS, and other operating systems are supported for development only and not for production.
  - Java Virtual Machine. See [supported environments](https://docs.camunda.io/docs/next/reference/supported-environments) for version details.
  - Configure the web applications to use an available port. By default, the Orchestration Cluster listens on port 8080.
- Secondary storage
  - Choose a supported secondary storage backend for your installation path.
  - **Document-store backend (Elasticsearch or OpenSearch)**: See [supported environments](https://docs.camunda.io/docs/next/reference/supported-environments).
    - For deployment options, see the [Elasticsearch documentation](https://www.elastic.co/docs/deploy-manage/deploy).
  - **RDBMS**: See [secondary storage architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#secondary-storage-architecture) for backend trade-offs, and [manual installation with RDBMS](https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/index) for supported databases and setup details.

For suggested minimum hardware requirements and networking, see the [manual reference architecture requirements](https://docs.camunda.io/docs/next/self-managed/reference-architecture/manual#requirements).

**Tip: Performance on musl-based distributions**

There are known performance limitations on systems that use `musl` instead of `glibc`, because Java relies on `glibc` for running native libraries. For example, Alpine Linux, which uses `musl`, has shown performance degradation compared to Debian or Ubuntu in benchmark tests.

**Warning: Unsupported components**

The following components are not supported for manual installation:

- Management Identity
- Optimize
- Camunda Hub

To install these components, use one of the supported methods:

- [Install with Docker](https://docs.camunda.io/docs/next/self-managed/deployment/docker/docker)
- [Install on Kubernetes with Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/index)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/install
