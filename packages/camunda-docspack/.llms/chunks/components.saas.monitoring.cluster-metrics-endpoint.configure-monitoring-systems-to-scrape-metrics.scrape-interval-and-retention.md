# Configure monitoring systems to scrape metrics — Scrape interval and retention

The Cluster Metrics endpoint exposes metrics from the most recent scrape only and does not retain historical data.

Configure your monitoring system to store and retain metrics as needed.


## Verify metric collection

After configuring scraping:

- Confirm that the scrape target reports a healthy state.
- Check that metrics correspond to the expected Camunda 8 cluster.

If metrics do not appear, review authentication, network access, and scrape configuration.


## Example dashboards

Camunda provides example Grafana dashboards in a public [GitHub repository](https://github.com/camunda/camunda/tree/main/monitor/grafana) that you can use to explore and visualize Cluster Metrics.

These dashboards serve as reference examples and may rely on additional metric sources, such as [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics) or [node-exporter](https://github.com/prometheus/node_exporter). You can adapt them to match your monitoring conventions, alerting rules, and operational requirements. Available metrics can vary depending on the Camunda version running in your cluster.

---
Source: https://docs.camunda.io/docs/next/components/saas/monitoring/cluster-metrics-endpoint/configure-monitoring-systems-to-scrape-metrics
