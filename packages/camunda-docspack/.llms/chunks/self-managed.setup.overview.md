# Install Camunda 8 Self-Managed for production and advanced development setups

Learn how to install Camunda 8 Self-Managed in production-ready environments (cloud or on-premises) and in advanced development setups that mirror production.

Use this overview to choose an installation approach for Camunda 8 Self-Managed in production-ready environments (cloud or on-premises), and in advanced development setups that mirror production for CI/CD, integration testing, or shared clusters.


## Production installations

**Note**
Starting in 8.9, Camunda 8 Run uses H2 as the default secondary storage out of the box. Elasticsearch remains a supported alternative in Camunda 8 Run. OpenSearch and RDBMS-based secondary storage are supported in Self-Managed deployments. See the [Camunda 8 Run configuration docs](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run) for backend configuration details.

- [**Helm/Kubernetes**](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install) (Recommended): We recommend using Kubernetes and Helm to run Camunda 8 Self-Managed in production. With the right configuration, Camunda 8 Self-Managed can be deployed on any Certified Kubernetes distribution (cloud or on-premises). We also officially support a variety of providers like [Red Hat OpenShift](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift) and [Amazon EKS](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/amazon-eks).
- [**Docker**](https://docs.camunda.io/docs/next/self-managed/deployment/docker/docker): Run Camunda components as [Docker images](https://hub.docker.com/u/camunda) in production on Linux systems. Windows and macOS are supported for development environments only.
- [**Manual**](https://docs.camunda.io/docs/next/self-managed/deployment/manual/install): Run each Java application on virtual machines or bare-metal servers with a supported Java Virtual Machine (JVM). This offers flexibility but requires manual configuration of component interactions. Use this approach only when necessary. Windows and macOS are supported for development environments only.

**Info**
To run Camunda 8 in a local environment for development or evaluation purposes only, see [running locally](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart).

---
Source: https://docs.camunda.io/docs/next/self-managed/setup/overview
