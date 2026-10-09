# Red Hat OpenShift

Deploy Camunda 8 Self-Managed on Red Hat OpenShift

<!-- (!) Note: Please ensure that this guide maintains a consistent structure and presentation style throughout, as with docs/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm.md. The user should have a similar experience when reading both guides. -->

Red Hat OpenShift, a Kubernetes distribution maintained by [Red Hat](https://www.redhat.com/en/technologies/cloud-computing/openshift), provides options for both managed and on-premises hosting.

Deploying Camunda 8 on Red Hat OpenShift is supported using Helm, given the appropriate configurations.

However, it's important to note that the [Security Context Constraints (SCCs)](#security-context-constraints-sccs) and [Routes](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift/redhat-openshift.md?current-ingress=openshift-routes#using-openshift-routes) configurations might require slight deviations from the guidelines provided in the [general Helm deployment guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install).

Additional information and a high-level overview of Kubernetes as the upstream project is available on our [Kubernetes deployment reference](https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
