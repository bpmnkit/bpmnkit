# Helm chart parameters

Overview of Helm chart parameters for Camunda Self-Managed.

Helm chart parameters let you configure the components and behavior of your Camunda Self-Managed installation. The main way to customize these parameters is by using a `values.yaml` file.

In Helm charts, the `values.yaml` file defines configuration for your deployment. To tailor your installation to your needs, you can override parameters in this file or provide your own values file. It's best practice to keep the original `values.yaml` unchanged and maintain a separate file with your custom settings.

**Tip: Templating support**
Some values in `values.yaml` support Go template expressions (for example, `{{ .Release.Name }}`). Values that support templating are marked with "Supports templating" in their description in `values.yaml`. This includes `podLabels`, `podAnnotations`, and `global.host`, among others.

The following tables show the **top-level configuration sections** in `values.yaml`. Each section controls a specific area of the chart.

### Global and orchestration cluster configuration

| Section         | Purpose                                                 |
| --------------- | ------------------------------------------------------- |
| `global`        | Configures shared settings that apply across components |
| `orchestration` | Configures orchestration cluster settings               |

For pod-level networking options such as `dnsPolicy`, `dnsConfig`, and `orchestration.hostNetwork`, see [configure pod networking](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/pod-networking).

For service-level options such as the `appProtocol` hint per port, see [configure Kubernetes Service ports](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/service-configuration).

### Other Camunda applications

| Section      | Purpose                                    |
| ------------ | ------------------------------------------ |
| `camundaHub` | Configures Camunda Hub                     |
| `connectors` | Configures the Connector runtime           |
| `identity`   | Configures the Management Identity service |
| `optimize`   | Configures the Optimize web application    |

### External infrastructure

Camunda 8.10 no longer bundles infrastructure subcharts. Deploy PostgreSQL, Elasticsearch or OpenSearch, and Keycloak separately from the Camunda Helm chart. This lets you use your preferred deployment methods, leverage managed services, and manage infrastructure lifecycles independently of Camunda. See [deploy required dependencies with Kubernetes operators](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure).

**Note**
Configure the secondary storage backend that fits your requirements. Depending on the component, topology, and version, you can use a document-store backend (Elasticsearch/OpenSearch) or an RDBMS-based secondary store.

See [RDBMS configuration](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration) and the glossary entry [RDBMS](https://docs.camunda.io/docs/next/reference/glossary#rdbms).

**Tip: Migrating from Bitnami subcharts?**
If you have an existing Camunda deployment using Bitnami subcharts, see the [migration guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/migration-from-bitnami/index) for step-by-step instructions and automated tooling to migrate your data to Kubernetes operators or managed services with minimal downtime.

### Observability

| Section                    | Purpose                                                    |
| -------------------------- | ---------------------------------------------------------- |
| `prometheusServiceMonitor` | Creates a Prometheus `ServiceMonitor` resource for metrics |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/chart-parameters
