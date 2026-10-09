# Amazon EC2 — Manage Camunda 8

### Monitoring

Camunda exposes metrics in Prometheus format by default. For details on scraping Camunda 8 metrics, see [metrics](https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics).

In AWS environments, you can leverage CloudWatch for log collection and for gathering [Prometheus metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/ContainerInsights-Prometheus-metrics.html). While Camunda natively integrates with Prometheus and Grafana, using CloudWatch for metrics visualization requires additional configuration.

### Backups

Refer to the general backup and restore documentation in [backup and restore](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore).

When using AWS, you can utilize [S3](https://aws.amazon.com/s3/) for backing up both Zeebe and Elasticsearch / OpenSearch data.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/cloud-providers/amazon/aws-ec2
