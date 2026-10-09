# RDBMS example deployment for Camunda with Helm — Installation workflow — Step 1: Choose your RDBMS

**PostgreSQL:**

- Bundled driver included; no additional setup required.
- Excellent Kubernetes operator support (optional).
- Managed services available on AWS (Aurora PostgreSQL), Azure, GCP, etc.

**Oracle:**

- Custom JDBC driver required; use init container to load.
- Advanced security and HA features.
- Managed services available on AWS (RDS), Azure, OCI.

**MariaDB/MySQL:**

- Bundled driver available for MariaDB; custom driver for MySQL.
- Community-friendly; good for development.
- Managed services widely available on AWS (RDS), Azure, GCP.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms
