# Install Camunda 8 on an EKS cluster — Deploy Camunda 8 via Helm charts — 3. Install Camunda 8 using Helm

Now that the `generated-values.yml` is ready, you can install Camunda 8 using Helm. Run the following command:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/single-region/procedure/install-chart.sh
```

This command:

- Installs (or upgrades) Camunda using the Helm chart.
- Substitutes the appropriate version using the `$CAMUNDA_HELM_CHART_VERSION` environment variable.
- Applies the configuration from `generated-values.yml`.

**Note**

This guide uses `helm upgrade --install` as it runs install on initial deployment and upgrades future usage. This simplifies future [Camunda 8 Helm upgrades](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/index) or any other component upgrades.

You can track the progress of the installation with the deployment readiness check script, which requires [jq](https://jqlang.github.io/jq/) to be installed.

The script polls the namespace until every pod is `Running` with all of its containers ready. If the deployment stalls, it reports the containers that are not ready, with their restart count, waiting reason, last termination reason, and exit code, together with recent warning events, so you can see what is blocking it.

Download the script and run it:

```bash
curl -fsSL https://raw.githubusercontent.com/camunda/camunda-deployment-references/main/generic/kubernetes/single-region/procedure/check-deployment-ready.sh -o check-deployment-ready.sh
chmod +x check-deployment-ready.sh
./check-deployment-ready.sh
```

Review the script before you run it.

Configure it with the following environment variables:

| Variable                            | Default   | Purpose                                                          |
| ----------------------------------- | --------- | ---------------------------------------------------------------- |
| `CAMUNDA_NAMESPACE`                 | `camunda` | Namespace to watch                                               |
| `DEPLOYMENT_READY_TIMEOUT_SECONDS`  | `1800`    | Wall-clock budget in seconds. Set it to `0` to wait indefinitely |
| `DEPLOYMENT_READY_INTERVAL_SECONDS` | `5`       | Delay in seconds between two polls                               |

See the check-deployment-ready.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/single-region/procedure/check-deployment-ready.sh
```

Understand how each component interacts with IRSA

#### Web Modeler

As the Web Modeler REST API uses PostgreSQL, configure the `restapi` to use IRSA with Amazon Aurora PostgreSQL. Check the [Web Modeler database configuration](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database#running-camunda-hub-on-amazon-aurora-postgresql) for more details.
Web Modeler already comes fitted with the [aws-advanced-jdbc-wrapper](https://github.com/awslabs/aws-advanced-jdbc-wrapper) within the Docker image.

#### Identity

Identity uses PostgreSQL, and `identity` is configured to use IRSA with Amazon Aurora PostgreSQL. Check the [Identity database configuration](https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables#running-identity-on-amazon-aurora-postgresql) for more details. Identity includes [aws-advanced-jdbc-wrapper](https://github.com/awslabs/aws-advanced-jdbc-wrapper) within the Docker image.

**Info: Keycloak with IRSA**
If you deploy Keycloak via the Keycloak Operator and want it to use IRSA for database access, refer to the [official Keycloak documentation](https://www.keycloak.org/server/db#preparing-keycloak-for-amazon-aurora-postgresql) for instructions on configuring Amazon Aurora PostgreSQL with a custom JDBC wrapper.

#### Amazon OpenSearch Service

##### Internal database configuration

The default setup is sufficient for Amazon OpenSearch Service clusters without **fine-grained access control**.

Fine-grained access control adds another layer of security to OpenSearch, requiring you to add a mapping between the IAM role and the internal OpenSearch role. Visit the [AWS documentation](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/fgac.html) on fine-grained access control.

There are different ways to configure the mapping within Amazon OpenSearch Service:

- Via a [Terraform module](https://registry.terraform.io/modules/idealo/opensearch/aws/latest) in case your OpenSearch instance is exposed.
- Via the [OpenSearch dashboard](https://opensearch.org/docs/latest/security/access-control/users-roles/).
- Via the **REST API**. To authorize the IAM role in OpenSearch for access, follow these steps:

  Use the following `curl` command to update the OpenSearch internal database and authorize the IAM role for access. Replace placeholders with your specific values:

  ```bash reference
  https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region-irsa/setup-opensearch-fgac.yml#L28-L48
  ```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm
