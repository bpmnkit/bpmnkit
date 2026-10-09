# Configure monitoring systems to scrape metrics — Troubleshoot common issues

### Authentication errors

**Observed behavior:** Your monitoring system reports an authentication or authorization failure when scraping the endpoint.

**Why this happens:** Either the configured credentials don't match what's set on the Cluster Metrics endpoint, or the monitoring system's IP address isn't allowlisted to reach it.

**How to fix:**

- Verify the configured username and password.
- Check that the monitoring system's IP address is allowlisted.

### Scrape timeouts

**Observed behavior:** Your monitoring system reports timeouts when scraping the endpoint, or scrapes intermittently fail.

**Why this happens:** The configured scrape timeout is too short for the response, or there's a network connectivity issue between your monitoring system and the endpoint.

**How to fix:**

- Increase the configured scrape timeout.
- Verify network connectivity to the metrics endpoint.

### Missing or incomplete metrics

**Observed behavior:** Scraping succeeds, but expected metrics are absent or incomplete.

**Why this happens:** The Cluster Metrics endpoint may be disabled or unhealthy for that cluster, the cluster may be running a version that doesn't support the metric, or the scrape interval and retention settings may not align with when the data was produced.

**How to fix:**

- Confirm that the Cluster Metrics endpoint for the cluster is enabled and healthy.
- Verify that the cluster is running a supported Camunda version.
- Review scrape interval and retention behavior.

---
Source: https://docs.camunda.io/docs/next/components/saas/monitoring/cluster-metrics-endpoint/configure-monitoring-systems-to-scrape-metrics
