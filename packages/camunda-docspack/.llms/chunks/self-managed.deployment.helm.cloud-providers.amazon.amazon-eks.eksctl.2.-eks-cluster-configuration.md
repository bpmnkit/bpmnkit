# Deploy an EKS cluster with eksctl — 2. EKS cluster — Configuration

```shell
##### Kubernetes parameters

# The name used for the Kubernetes cluster
export CLUSTER_NAME=camunda-cluster
# Your standard region that you host AWS resources in
export REGION="$AWS_REGION"
# Multi-zones, derived from the region
export ZONES="${REGION}a ${REGION}b ${REGION}c"
# The AWS Account ID
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
# CIDR range used for the VPC subnets
export CIDR=10.192.0.0/16

# Optional
# Default node type for the Kubernetes cluster
export NODE_TYPE=m7i.xlarge
# Initial node count to create the cluster with
export NODE_COUNT=4
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
