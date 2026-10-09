# Red Hat OpenShift — Pitfalls to avoid — permissive-scc

#### Permissive SCCs

If you deploy Camunda 8 (and related infrastructure) with permissive SCCs out of the box, there's nothing specific for you to configure. Here, permissive SCCs refer to those where the strategy for `RunAsUser` is defined as `RunAsAny` (including root).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
