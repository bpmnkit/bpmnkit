# Configuration — Testcontainers runtime

The default runtime of CPT is based on [Testcontainers](https://java.testcontainers.org/). It uses the Camunda Docker
image and includes the following components:

- Camunda
- Connectors

**Note: Why Testcontainers?**
CPT follows a common practice by using Testcontainers to provide an isolated, reproducible, and easily configurable
environment using Docker containers. This ensures consistent test results, simplifies setup across different platforms,
and allows integration with Camunda and other components without manual installation or complex dependencies.

**Tip: Shared runtime**
If you use the same runtime configuration for all test classes, then you can use a [shared runtime](#shared-runtime) to
speed up the test execution.

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
