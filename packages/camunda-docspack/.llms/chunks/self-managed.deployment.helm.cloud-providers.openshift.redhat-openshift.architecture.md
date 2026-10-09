# Red Hat OpenShift — Architecture

This section installs Camunda 8 following the architecture described in the [reference architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture). The architecture includes the following core components:

- **Orchestration Cluster**: Core process execution engine (Zeebe, Operate, Tasklist, and Admin)
- **Web Modeler and Console**: Management and design tools (Web Modeler, Console, and Management Identity)

Infrastructure components are deployed using **official Kubernetes operators** as described in [Deploy infrastructure with Kubernetes operators](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure):

- **[Elasticsearch with ECK](#deploy-elasticsearch)**: Document-store example path used in this guide for secondary storage
- **[PostgreSQL with CloudNativePG](#deploy-postgresql)**: Deployed via [CloudNativePG](https://cloudnative-pg.io/) for Identity and Camunda Hub databases
- **[Keycloak](#deploy-keycloak) (optional)**: Deployed via the [Keycloak Operator](https://www.keycloak.org/operator/installation) as an identity provider for Single Sign-On (SSO)

For OpenShift deployments, the following OpenShift-specific configurations are also included:

- **OpenShift Routes**: Native OpenShift way to expose services externally (alternative to standard Kubernetes Ingress)
- **Security Context Constraints (SCCs)**: Security framework for controlling pod and container permissions

**Note: Single namespace deployment**
This guide uses a single Kubernetes namespace for simplicity, since the deployment is done with a single Helm chart. This differs from the [reference architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#orchestration-cluster-vs-camunda-hub), which recommends separating Orchestration Cluster and Web Modeler or Console into different namespaces in production to improve isolation and enable independent scaling.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
