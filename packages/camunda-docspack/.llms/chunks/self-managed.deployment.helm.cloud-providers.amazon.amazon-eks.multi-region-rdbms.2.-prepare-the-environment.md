# Multi-region setup with RDBMS (EKS) — 2. Prepare the environment

### Export the Terraform outputs

The procedure scripts derive the entire environment from the Terraform state, down to the kubectl context aliases, so nothing has to be typed twice.

```bash
cd ../../procedure
. ./export-terraform-outputs.sh
. ./export_environment_prerequisites.sh
```

**Note**
The dot is required. These scripts export variables into your current shell, not into a subshell.

`export_environment_prerequisites.sh` defines the environment contract of the architecture. You can override every value by exporting it beforehand. Region-indexed values are space-separated lists in slot order.

`export-terraform-outputs.sh` always sets `CAMUNDA_RDBMS_URL`, `CAMUNDA_RDBMS_USERNAME`, and `CAMUNDA_RDBMS_PASSWORD` from the Terraform outputs. They are empty with `deploy_database = false`. If you bring your own database, export these three values after that script and before `export_environment_prerequisites.sh`.

See the export_environment_prerequisites.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/export_environment_prerequisites.sh
```

The script refuses to continue if the topology is inconsistent, for example if more than one slot is left empty.

**Note: One namespace in every cluster**
The [dual-region setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region) needs a different namespace per region, because CoreDNS stub forwarding cannot distinguish local from remote traffic. This architecture instead uses the **same namespace name in every cluster**. Submariner disambiguates identically named services with the cluster ID prefix.

### Register the kubectl contexts

Create one kubectl context per active region, named after the region's short name, for example `cluster-london`. The rest of the guide selects regions by these names.

```bash
./register-kubecontexts.sh
```

See the register-kubecontexts.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/register-kubecontexts.sh
```

### Configure the storage class

Zeebe brokers need a storage class backed by fast disks. Apply it in every region:

```bash
./storageclass-configure.sh
```

See the storageclass-configure.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/storageclass-configure.sh
```

Verify it before continuing. A missing storage class leaves broker PVCs unbound and the pods pending, which is easy to misread later as a networking failure:

```bash
./storageclass-verify.sh
```

See the storageclass-verify.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/storageclass-verify.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
