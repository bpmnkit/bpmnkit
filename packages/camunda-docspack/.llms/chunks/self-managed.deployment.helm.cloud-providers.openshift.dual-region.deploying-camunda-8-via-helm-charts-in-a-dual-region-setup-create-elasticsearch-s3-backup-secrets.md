# Red Hat OpenShift Dual-Region — Deploying Camunda 8 via Helm charts in a dual-region setup — Create Elasticsearch S3 backup secrets

Elasticsearch will need an S3 bucket for data backup and restore procedure, required during a regional failback. For this, you will need to configure a Kubernetes secret to not expose those in cleartext.

If you don't have access to an S3 bucket, you can adapt the backup method to use an [alternative Elasticsearch backup solution](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshot-restore.html). However, this guide focuses solely on S3 snapshots.

**Caution: Bucket vulnerable to region outages**

The Elasticsearch backup [bucket is tied to a specific region](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html). If that region becomes unavailable and you want to restore to a different region or S3 services remain disrupted, you must create a new bucket in another region and reconfigure your Elasticsearch cluster to use the new bucket.

The following script creates the ECK-compatible secure settings secrets for S3 backup access in both regions. These secrets must exist before the Elasticsearch cluster is deployed, as the ECK Elasticsearch CRD references them for keystore injection at startup.

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/openshift/dual-region/procedure/create-elasticsearch-secrets.sh
```

Save it as `create-elasticsearch-secrets.sh`, and execute it:

```bash
chmod +x create-elasticsearch-secrets.sh
./create-elasticsearch-secrets.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region
