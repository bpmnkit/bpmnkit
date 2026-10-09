# Upgrade Camunda components from 8.9 to 8.10 — Rolling upgrades

There is no rolling upgrade path from Web Modeler 8.9 to Camunda Hub 8.10. Shut down all Web Modeler instances so the database has no more writers, take a database backup, then start one or more Camunda Hub 8.10 instances. Starting Camunda Hub triggers the database migration; once it completes, Hub resumes serving traffic. See [version upgrade](https://docs.camunda.io/docs/next/self-managed/components/hub/version-upgrade) for the underlying principles.

If you deploy with Helm, this procedure is already handled for you via the `camundaHub.upgrade.phase` values. See [migrate Camunda Hub](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100#migrate-web-modeler-and-console-to-camunda-hub) for the Helm-specific steps. You do not need to perform the manual steps above.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
