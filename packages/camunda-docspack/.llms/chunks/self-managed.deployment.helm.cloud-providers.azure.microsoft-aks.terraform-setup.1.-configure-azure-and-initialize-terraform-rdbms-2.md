# Deploy an AKS cluster with Terraform (advanced) — 1. Configure Azure and initialize Terraform — rdbms

The RDBMS variant extends the base PostgreSQL configuration with an additional **orchestration database** used as the secondary storage for Operate, Tasklist, and the Orchestration Cluster REST API:

```hcl reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region-rdbms/db.tf#L1-L26
```

In addition to the Identity and Web Modeler databases, this variant creates:

- A `camunda_orchestration` database for RDBMS secondary storage
- A dedicated `orchestration_db` user with a randomly generated password

This module is **enabled by default**. To opt out, you must:

- Remove the `db.tf` file from the root
- Manually provide credentials and PostgreSQL endpoints for the Helm chart

**Tip: Alternative: Operator-based PostgreSQL deployment**
If your organization does not want to use a managed Azure Database for PostgreSQL service, CloudNativePG is an option.
For more details on the PostgreSQL deployment with CloudNativePG Operator, see [PostgreSQL deployment in the operator-based infrastructure guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#postgresql-deployment) for a production-grade setup with automated scaling, upgrades, and built-in security.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
