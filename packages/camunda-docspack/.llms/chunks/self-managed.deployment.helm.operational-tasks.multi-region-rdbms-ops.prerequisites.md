# Multi-Region RDBMS operational procedure — Prerequisites

You need a local copy of the [`aws/kubernetes/eks-multi-region-rdbms`](https://github.com/camunda/camunda-deployment-references/tree/main/aws/kubernetes/eks-multi-region-rdbms) reference architecture, from the [camunda-deployment-references](https://github.com/camunda/camunda-deployment-references) repository. It holds the Terraform modules, the Helm values, and every procedure script this documentation refers to.

The following clones the repository and changes into the architecture directory. Every command in this documentation runs from there.

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/get-your-copy.sh
```

The reference architecture is a starting point you own and extend, not a module you consume, so the workflow is to copy it into your own repository rather than reference it remotely.

Source the environment before running any procedure. The scripts derive everything from the Terraform state, and refuse to run against an inconsistent topology:

```bash
cd procedure
. ./export-terraform-outputs.sh
. ./export_environment_prerequisites.sh
```

Source them with the leading dot (`. ./script.sh`). These scripts export variables into your current shell, not into a subshell. For what each variable means, see [prepare the environment](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms#2-prepare-the-environment) in the deployment guide.

You also need the credentials and the CLI tools the deployment used: `kubectl` contexts for every active region, `helm`, `jq`, and your cloud provider's CLI. The [deployment guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms#requirements) lists them.

Confirm the cluster is healthy before you start, so you can tell what the procedure changed:

```bash
./check-cluster-topology.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops
