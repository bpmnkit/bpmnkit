# Validate RDBMS connectivity — Notes and caveats

- **Timing:** Schema creation and exporter startup occur during application startup. Exported data visibility depends on the exporter `flushInterval` and workload.
- If observed behavior or log lines differ from this documentation, open an issue and include:
  - Relevant log excerpts
  - Helm values used for RDBMS configuration
  - Database type and version

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/validate-rdbms
