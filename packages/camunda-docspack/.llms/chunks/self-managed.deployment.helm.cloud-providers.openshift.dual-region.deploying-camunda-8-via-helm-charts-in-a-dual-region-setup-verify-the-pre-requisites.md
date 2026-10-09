# Red Hat OpenShift Dual-Region — Deploying Camunda 8 via Helm charts in a dual-region setup — Verify the pre-requisites

Before proceeding with the installation, ensure the required information is available and configured in your terminal for later use.
Review and adjust the following environment script to match your specific configuration:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/chart-env.sh
```

_If you are unsure about the values of the backup bucket, please refer to the [S3 backup bucket module setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup-dual-region#s3-backup-bucket-module-setup) as a reference for implementation._

Save the file as `chart-env.sh`, replace the placeholders with your values, and then source the file:

```bash
source chart-env.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region
