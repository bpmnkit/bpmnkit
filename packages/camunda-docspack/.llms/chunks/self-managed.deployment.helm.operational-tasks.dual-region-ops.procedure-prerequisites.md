# Helm chart dual-region operational procedure — Procedure — Prerequisites

The following procedures assume the following dual-region deployment for:

- **AWS:** the deployment has been created using [AWS setup guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region) and you have your own copy of the [camunda-deployment-references](https://github.com/camunda/camunda-deployment-references/tree/main/aws/kubernetes/eks-dual-region) repository and previously completed changes in the `camunda-values.yml` to adjust them in your setup.
  Follow the [dual-region cluster deployment](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region#3-deploy-camunda-8-via-helm-charts) guide to install Camunda 8, configure a dual-region setup, and have the general environment variables (see [environment prerequisites](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region#export-environment-variables) already set up).

- **OpenShift:** the deployment has been created using [OpenShift setup guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region#deploying-camunda-8-via-helm-charts-in-a-dual-region-setup) and previously completed changes in your `generated-values-region-0.yml` and `generated-values-region-1.yml` to adjust them in your setup.

**Note: OpenShift cluster reference**

The OpenShift guide now uses the same 0-indexed naming convention as the AWS guide: `CLUSTER_0`/`CLUSTER_1` for cluster contexts and `CAMUNDA_NAMESPACE_0`/`CAMUNDA_NAMESPACE_1` for namespaces. No conversion is needed.

In version 8.8 and earlier, the OpenShift guide used 1-indexed naming (`CLUSTER_1_NAME`/`CLUSTER_2_NAME` and `CAMUNDA_NAMESPACE_1`/`CAMUNDA_NAMESPACE_2`), which required converting variable names before following this procedure.

We will avoid referencing both scenarios of losing either region. Instead, we have generalized the commands and require a one-time setup to configure environment variables, enabling you to execute the procedure based on the surviving region and the one that needs to be recreated.
Depending on which region you lost, select the correct tab below and export those environment variables to your terminal for a smoother procedure execution:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
