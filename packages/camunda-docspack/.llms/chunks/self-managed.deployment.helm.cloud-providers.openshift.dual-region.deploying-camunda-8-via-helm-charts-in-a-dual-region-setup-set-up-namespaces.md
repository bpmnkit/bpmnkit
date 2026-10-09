# Red Hat OpenShift Dual-Region — Deploying Camunda 8 via Helm charts in a dual-region setup — Set up namespaces

Submariner requires that each cluster has both namespaces present.

Create the required namespaces in both clusters:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/setup-namespaces.sh
```

Save it as `setup-namespaces.sh`, and execute it:

```bash
chmod +x setup-namespaces.sh
./setup-namespaces.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region
