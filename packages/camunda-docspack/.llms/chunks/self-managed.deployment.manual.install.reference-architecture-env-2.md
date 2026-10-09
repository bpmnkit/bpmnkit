# Camunda manual installation — Reference architecture — env

```bash
CAMUNDA_CLUSTER_SIZE=3
CAMUNDA_CLUSTER_NODEID=0 # unique ID of this broker node in a cluster. The ID should be between 0 and number of nodes in the cluster (exclusive).
CAMUNDA_CLUSTER_INITIALCONTACTPOINTS=HOST_0:26502,HOST_1:26502,HOST_2:26502
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/install
