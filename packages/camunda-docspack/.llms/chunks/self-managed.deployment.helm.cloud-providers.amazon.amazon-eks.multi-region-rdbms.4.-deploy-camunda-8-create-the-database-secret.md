# Multi-region setup with RDBMS (EKS) — 4. Deploy Camunda 8 — Create the database secret

Create the Kubernetes secret holding the database password, in every active region. The Helm values reference it by name rather than carrying the password.

```bash
./create-rdbms-secret.sh
```

See the create-rdbms-secret.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/create-rdbms-secret.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
