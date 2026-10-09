# Camunda components flow control configuration — View write rate limits in Grafana

### Throttling

Dynamic throttling, when actively acting on the current rate (and not only enabled), displays in Grafana with an underlying yellow bar for the period it was active.

![backpressure-throttling](img/backpressure-throttling.png)

### Exporting backlog

The exporting backlog panel is found under the **Processing** row and displays the number of records not yet exported per partition.

![exporting-backlog](img/exporting-backlog.png)

### Exporting and write rate

The **Measured exporting rate** and **Accepted writes by source** panels are found under the **Logstream** row. The first shows the number of records
accepted by flow control per second, organized by partition and write source (for example, processing result, scheduled tasks, etc.). The second displays measured average exporting rate which may be used to throttle write rate.

![measured-exporting-rate](img/mesured-exporting-rate.png)
![accepted-by-writes-source](img/accepted-by-writes-source.png)

#### Write rate limit

The **Write rate limits** panel is under the **Logstream** row, and displays the current and maximum permissible write rate limit per partition.

![write-rate-limit](img/write-rate-limit.png)

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/configure-flow-control/configure-flow-control
