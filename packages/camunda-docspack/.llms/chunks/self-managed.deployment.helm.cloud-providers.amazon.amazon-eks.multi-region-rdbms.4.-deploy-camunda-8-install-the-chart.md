# Multi-region setup with RDBMS (EKS) — 4. Deploy Camunda 8 — Install the chart

Install the same release in every active region, from the values assembled in the previous step.

```bash
./install-chart.sh
```

See the install-chart.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/install-chart.sh
```

Then export the Camunda services to the ClusterSet so brokers in other regions can resolve them:

```bash
./submariner/export-services.sh
```

See the export-services.sh script
```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-multi-region-rdbms/procedure/submariner/export-services.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
