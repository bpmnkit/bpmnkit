# Dual-region setup (EKS) — 3. Deploy Camunda 8 via Helm charts — Install Camunda 8 using Helm

From the terminal context of `aws/kubernetes/eks-dual-region/helm-values`, and ensure you have previously exported the [environment variables](#export-environment-variables), execute the following:

```bash
helm install $CAMUNDA_RELEASE_NAME $HELM_CHART_REF \
  --version $HELM_CHART_VERSION \
  --kube-context $CLUSTER_0 \
  --namespace $CAMUNDA_NAMESPACE_0 \
  -f camunda-values.yml \
  -f ../../../../generic/kubernetes/operator-based/elasticsearch/camunda-elastic-values.yml \
  -f region0/camunda-values.yml

helm install $CAMUNDA_RELEASE_NAME $HELM_CHART_REF \
  --version $HELM_CHART_VERSION \
  --kube-context $CLUSTER_1 \
  --namespace $CAMUNDA_NAMESPACE_1 \
  -f camunda-values.yml \
  -f ../../../../generic/kubernetes/operator-based/elasticsearch/camunda-elastic-values.yml \
  -f region1/camunda-values.yml
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region
