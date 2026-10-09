# Red Hat OpenShift Dual-Region — Deploying Camunda 8 via Helm charts in a dual-region setup

**Info: Migration from Bitnami Elasticsearch to ECK in dual-region**

There is currently no dedicated migration procedure for moving from the Bitnami Elasticsearch subchart to the ECK operator in a dual-region setup. If you need to perform this migration, follow the [single-region migration procedure (documented for Camunda 8.9)](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/migration-from-bitnami/index) and apply it individually to each region.

The installation of Camunda 8 in OpenShift across dual regions requires a functioning Submariner setup connecting two OpenShift clusters.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region
