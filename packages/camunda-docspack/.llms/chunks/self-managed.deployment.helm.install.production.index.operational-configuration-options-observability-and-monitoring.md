# Install Camunda for production with Helm — Operational configuration options — Observability and monitoring

The following resources and configuration options are important to keep in mind regarding observability and monitoring:

- It is possible to enable integration with Prometheus, a popular monitoring solution, in the Camunda Helm chart. This can be configured by adding the following configuration below to your preferred Helm values file:

  ```yaml
  prometheusServiceMonitor:
    enabled: true
  ```

- A tool such as [Loki](https://grafana.com/oss/loki/) can be used for the retention and archival of logs. It can also be used to aggregate logs.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
