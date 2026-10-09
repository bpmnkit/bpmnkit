# Configure Camunda 8 Run — Access metrics

Metrics are enabled in Camunda 8 Run by default and can be accessed at [http://localhost:9600/actuator/prometheus](http://localhost:9600/actuator/prometheus).

For more information, see the [metrics](https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics) documentation.


## Environment variables

The following advanced configuration options can be provided via environment variables:

| Variable    | Description                                                      |
| ----------- | ---------------------------------------------------------------- |
| `JAVA_OPTS` | Allows you to override Java command line parameters for Camunda. |


## Next steps

- Review [configure secondary storage in Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/secondary-storage).
- Review [install and start Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/install-start).
- Identify and resolve [common issues when starting, configuring, or using Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run-troubleshooting).

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/configuration
