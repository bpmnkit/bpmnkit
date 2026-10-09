# Multi-region setup with RDBMS (EKS) — 3. Connect the clusters — Install subctl

Install the Submariner CLI and put it on your `PATH`. Source the script rather than executing it, so the `PATH` change survives in your shell.

```bash
source ./submariner/install-subctl.sh
```

See the install-subctl.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/submariner/install-subctl.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
