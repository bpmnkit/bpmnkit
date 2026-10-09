# Use the Camunda Helm Toolkit — Prepare your files

Provide your own override files, such as the files you pass to Helm with `-f`, rather than the chart's default `values.yaml`.

- Install Docker and use a local Docker daemon with Linux containers.
- Keep a copy of your original overrides. For layered configurations, keep the files separate and record their Helm `-f` order.
- Identify the source and target Camunda versions. The examples on this page migrate 8.9 overrides to 8.10.

The examples use the [public Docker image](https://hub.docker.com/r/camunda/camunda-helm-toolkit/tags). Its `SNAPSHOT` tag is a rolling build, not a versioned release, and can change between pulls. The CLI examples use a POSIX-compatible shell on macOS or Linux. The Web UI avoids host-path mount commands.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit
