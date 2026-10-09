# Install Camunda 8 on an EKS cluster — Export environment variables

To streamline the execution of the subsequent commands, it is recommended to export multiple environment variables.

### Export the AWS region and Helm chart version

The following are the required environment variables with some example values:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region/procedure/setting-region.sh
```

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/single-region/procedure/chart-env.sh
```

- `CAMUNDA_NAMESPACE` is the Kubernetes namespace where Camunda will be installed.
- `CAMUNDA_RELEASE_NAME` is the name of the Helm release associated with this Camunda installation.

### Export database values

When using either standard authentication (network based or username and password) or IRSA authentication, specific environment variables must be set with valid values. Follow the guide for either [eksctl](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl#configuration-1) or [Terraform](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup#export-values-for-the-helm-chart) to set them correctly.

Verify the configuration of your environment variables by running the following loop:

### standard

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region/procedure/check-env-variables.sh
```

### irsa

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region-irsa/procedure/check-env-variables.sh
```

### rdbms

The RDBMS variant configures Amazon Aurora PostgreSQL as the secondary storage and requires additional orchestration database variables on top of the base configuration:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region-rdbms/procedure/check-env-variables.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm
