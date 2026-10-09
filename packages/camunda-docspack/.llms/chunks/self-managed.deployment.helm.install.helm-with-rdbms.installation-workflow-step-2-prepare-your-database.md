# RDBMS example deployment for Camunda with Helm — Installation workflow — Step 2: Prepare your database

**Note: On Amazon Aurora PostgreSQL**
Skip the local `createdb` and `createuser` commands. Connect to your Aurora writer endpoint with `psql`, and prefer IAM database authentication over a static password. See [Install Camunda 8 on an EKS cluster](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm) and the [Aurora Terraform module](https://github.com/camunda/camunda-deployment-references/tree/stable/8.9/aws/modules/aurora).

Create a database and user. For example, in PostgreSQL:

```bash
createdb camunda
createuser camunda
```

Then set permissions:

```sql
ALTER USER camunda WITH PASSWORD 'your-secure-password';
GRANT CONNECT ON DATABASE camunda TO camunda;
GRANT USAGE ON SCHEMA public TO camunda;
GRANT CREATE ON SCHEMA public TO camunda;
```

**Note**
The user needs DDL permissions only if you enable auto-schema creation (`autoDDL: true`). For manually managed schemas, only SELECT/INSERT/UPDATE/DELETE permissions are needed.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms
