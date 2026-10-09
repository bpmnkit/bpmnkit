# SaaS clusters — Recovery objectives by outage type — Availability Target versus recovery objectives

The Availability Target and recovery objectives measure different things. Keep them separate when you plan for disaster recovery.

- **The Availability Target** is a contractual commitment. It measures the percentage of minutes in a calendar month during which the Orchestration Cluster is available, based on connection checks by Camunda's monitoring system, as defined in your agreement with Camunda. It doesn't describe what happens during or immediately after an outage.
- **RTO (Recovery Time Objective)** measures how long a failure disrupts service, from the moment it starts affecting your cluster until the cluster is fully functional again. For outages that need manual recovery, RTO also includes the time to detect, escalate, and diagnose the problem.
- **RPO (Recovery Point Objective)** measures how much data you can lose when that failure happens, expressed as the time between the last recoverable point and the failure.

A high Availability Target doesn't imply a fast recovery or minimal data loss during a major infrastructure failure. The Availability Target tells you how rarely a failure disrupts your cluster; RTO and RPO tell you how well the cluster recovers when a major failure does happen.

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters
