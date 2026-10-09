# Multi-region setup with RDBMS (EKS) — 3. Connect the clusters — Verify the cross-region substrate

Check that pods in one region can reach pods in another before you deploy Camunda. Submariner does not carry this traffic, so nothing else covers the Transit Gateway routes and the security group rules.

```bash
./setup-namespaces.sh
./verify-cross-region-connectivity.sh
```

If this fails, the problem is routing or firewalling, not Camunda. See [troubleshooting](#troubleshooting).

The probe image is set in [diagnose-submariner.sh](https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/submariner/diagnose-submariner.sh). Set `PROBE_IMAGE` before the script to pull from an approved mirror instead:

```bash
export PROBE_IMAGE=my-registry.example.com/busybox
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
