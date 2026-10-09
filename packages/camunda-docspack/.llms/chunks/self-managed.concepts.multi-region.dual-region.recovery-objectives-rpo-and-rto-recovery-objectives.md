# Dual-Region — Recovery objectives (RPO and RTO) {#recovery-objectives}

Based on the requirements and limitations outlined in this page, you can use the **Recovery Point Objective (RPO)** and **Recovery Time Objective (RTO)** values below to inform your risk assessment.

The **RPO** is the maximum tolerable data loss measured in time.

The **Recovery Time Objective (RTO)** is the time required to restore services to a functional state.

For Operate, Tasklist, and Zeebe, the **RPO** is **0**.

The **RTO** applies to both the failover and failback procedures:

- **Failover** RTO: **< 1 minute** to restore a functional state, excluding DNS reconfiguration and network considerations.
- **Failback** RTO: **Five minutes plus** the time required to back up and restore Elasticsearch. This depends on your setup and chosen [Elasticsearch backup type](https://www.elastic.co/guide/en/elasticsearch/reference/current/snapshots-register-repository.html#ess-repo-types).

In internal tests, reinstalling and reconfiguring Camunda 8 takes approximately five minutes. Treat this as a general guideline. Actual times vary depending on available resources and your familiarity with the procedure.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region
