# Install Camunda 8 on an EKS cluster — Deploy Camunda 8 via Helm charts — 2. Configure your deployment

#### Enable Enterprise components

Web Modeler, Console, and Management Identity are not enabled by default in this deployment.

To enable these enterprise components in an OIDC-enabled full cluster, first deploy the required infrastructure (PostgreSQL, Elasticsearch/OpenSearch, and an IdP, such as Keycloak) using the official operators, then apply the Helm values examples shown in [deploy required dependencies with operators](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure).

#### Secondary storage options

This guide supports a managed Amazon OpenSearch domain (provisioned in the [eksctl](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl) or [Terraform](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup) setup) or Amazon Aurora PostgreSQL as secondary storage. For a comparison of both backends and their reference architectures, see [Secondary storage](#secondary-storage), then select your backend using the authentication and values tabs shown earlier in this guide.

RDBMS as secondary storage disables Optimize unless you also deploy Elasticsearch or OpenSearch alongside it.

To use Elasticsearch instead of managed OpenSearch, deploy it with [Elastic Cloud on Kubernetes (ECK)](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#elasticsearch-deployment), then configure the component-scoped connection values. The bundled Bitnami Elasticsearch subchart is removed in Camunda 8.10.

#### Use an in-cluster PostgreSQL instead of the managed Aurora

To run PostgreSQL inside the cluster instead of managed Aurora, deploy it with the [CloudNativePG operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#postgresql-deployment) and point Management Identity and Camunda Hub at it through their `externalDatabase` values. The bundled Bitnami PostgreSQL subchart is removed in Camunda 8.10, so there is no in-chart PostgreSQL to enable.

#### Fill your deployment with actual values

Once you've prepared the `values.yml` file, run the following `envsubst` command to substitute the environment variables with their actual values:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/single-region/procedure/assemble-envsubst-values.sh
```

**Note: Web Modeler SMTP secret**
If you plan to enable Web Modeler, create the SMTP secret required for email notifications ([see how it's used by Web Modeler](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties#smtp--email)):

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region/procedure/create-webmodeler-secret.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm
