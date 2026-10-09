# Multi-region setup with RDBMS (EKS) — 3. Connect the clusters — Join the clusters to the ClusterSet

Join every active region to the ClusterSet, so each one can publish and resolve the others' services.

```bash
./submariner/join-clusters.sh
```

See the join-clusters.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/submariner/join-clusters.sh
```

Then verify:

```bash
./submariner/verify-submariner.sh
```

See the verify-submariner.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/submariner/verify-submariner.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
