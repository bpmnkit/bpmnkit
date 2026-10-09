# Red Hat OpenShift Dual-Region — Deploying Camunda 8 via Helm charts in a dual-region setup — Synchronize Elasticsearch passwords across regions

Each ECK-managed Elasticsearch cluster auto-generates its own `elasticsearch-es-elastic-user` secret with a unique password. For Zeebe exporters to authenticate against the remote region's Elasticsearch, each region needs access to the other region's password.

The following script reads the ECK-generated passwords and creates region-specific secrets in both regions:

- `elasticsearch-es-password-region-0`: password from region 0's Elasticsearch
- `elasticsearch-es-password-region-1`: password from region 1's Elasticsearch

These secrets are referenced by the Zeebe exporter configuration in the values files to authenticate against Elasticsearch in each region.

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/sync-elasticsearch-passwords.sh
```

Save it as `sync-elasticsearch-passwords.sh`, and execute it:

```bash
chmod +x sync-elasticsearch-passwords.sh
./sync-elasticsearch-passwords.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region
