# Configure monitoring systems to scrape metrics — Metrics endpoint details

The metrics endpoint:

- Uses HTTPS
- Requires Basic Authentication
- Returns metrics in Prometheus format

### Endpoint format

The full metrics endpoint follows this format: `https://<metrics-target>/<cluster-id>`

- `<metrics-target>`: The domain hosting the metrics endpoint.
- `<cluster-id>`: The identifier of the Camunda 8 SaaS cluster.

### Verify endpoint access

Before configuring your monitoring system, use the following command to verify that the Cluster Metrics endpoint is reachable:

```bash
curl -v -u "<username>:<password>" https://<metrics-target>/<cluster-id>
```


## Configure Prometheus scraping

Prometheus can scrape the Cluster Metrics endpoint directly.

### Example scrape configuration

```yaml
scrape_configs:
  - job_name: "c8-<cluster-id>"
    scheme: https
    metrics_path: /<cluster-id>
    static_configs:
      - targets:
          - <metrics-target>
    basic_auth:
      username: <username>
      password: <password>
    scrape_timeout: 5s
    scrape_interval: 30s
```

Configuration notes:

- Use HTTPS.
- Configure Basic authentication using the credentials provided when the Cluster Metrics endpoint was enabled.
- A scrape timeout of less than 10 seconds is recommended.
- A scrape interval of at least 15 seconds is recommended. Metrics are collected every 15–30 seconds, so shorter intervals do not produce new data.

---
Source: https://docs.camunda.io/docs/next/components/saas/monitoring/cluster-metrics-endpoint/configure-monitoring-systems-to-scrape-metrics
