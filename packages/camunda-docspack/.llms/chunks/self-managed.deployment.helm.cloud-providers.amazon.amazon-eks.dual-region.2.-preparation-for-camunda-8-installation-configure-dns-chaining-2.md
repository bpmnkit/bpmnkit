# Dual-region setup (EKS) — 2. Preparation for Camunda 8 installation — Configure DNS chaining (2)

The script [test_dns_chaining.sh](https://github.com/camunda/camunda-deployment-references/tree/main/aws/kubernetes/eks-dual-region/procedure/test_dns_chaining.sh) within the folder `aws/kubernetes/eks-dual-region/procedure/` of the repository will help to test that the DNS chaining is working by using nginx pods and services to ping each other.

1. Execute the [test_dns_chaining.sh](https://github.com/camunda/camunda-deployment-references/tree/main/aws/kubernetes/eks-dual-region/procedure/test_dns_chaining.sh). Make sure you have previously exported the [environment variables](#export-environment-variables) as the script builds on top of it.

```bash
./test_dns_chaining.sh
```

2. Watch how a nginx pod and service will be deployed per cluster. It will wait until the pods are ready and finally ping from nginx in cluster 0 the nginx in cluster 1 and vice versa. If it fails to contact the other nginx five times, it will fail.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region
