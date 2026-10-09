# Deploy an EKS cluster with eksctl — 3. PostgreSQL database — Configuration

```shell
##### Postgres parameters

# Name for the Postgres DB cluster and instance
export RDS_NAME=camunda-postgres
# Postgres DB admin username
export AURORA_USERNAME=secret_user
# Postgres DB password of the admin user
export AURORA_PASSWORD=camundarocks123
# The PostgreSQL version
export POSTGRESQL_VERSION=17.5

# For each database, we need to generate a username, password and database name
export DB_KEYCLOAK_NAME="keycloak_db"
export DB_KEYCLOAK_USERNAME="keycloak-pg"
export DB_KEYCLOAK_PASSWORD="CHANGE-ME-PLEASE"

export DB_IDENTITY_NAME="identity_db"
export DB_IDENTITY_USERNAME="identity-pg"
export DB_IDENTITY_PASSWORD="CHANGE-ME-PLEASE"

export DB_WEBMODELER_NAME="webmodeler_db"
export DB_WEBMODELER_USERNAME="webmodeler-pg"
export DB_WEBMODELER_PASSWORD="CHANGE-ME-PLEASE"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
