# Deploy required dependencies with Kubernetes operators — Quick start

### Step 1: Get deployment resources

All configuration files, deployment scripts, and automation tools referenced in this guide are available in the Camunda deployment references repository:

**Repository**: [camunda-deployment-references](https://github.com/camunda/camunda-deployment-references/tree/main/generic/kubernetes/operator-based)

Quick deployment commands

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/get-your-copy.sh
```

Then execute:

```bash
# Set up environment (required for all deployments)
source ./0-set-environment.sh

# Review and deploy infrastructure components in order
# PostgreSQL deployment
cd postgresql/
cat deploy.sh  # Review the deployment script
./deploy.sh

# Elasticsearch deployment
cd ../elasticsearch/
cat deploy.sh  # Review the deployment script
./deploy.sh

# Keycloak deployment
cd ../keycloak/
cat deploy.sh  # Review the deployment script
./deploy.sh
```

The deployment scripts (`deploy.sh`) contain all the necessary steps to install each component. You can either execute them directly or use them as reference for manual deployment or GitOps integration.

### Step 2: Environment setup

All deployment scripts require environment variables to be set. This is a prerequisite for all subsequent steps:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/0-set-environment.sh
```

**Note**
Ensure you source this environment setup before running any deployment scripts in the following sections.

### Step 3: Deployment overview

Each infrastructure component should be deployed individually in the following order:

| Order | Component                                      | Dependencies | Purpose                                                              |
| ----- | ---------------------------------------------- | ------------ | -------------------------------------------------------------------- |
| 1     | **[PostgreSQL](#postgresql-deployment)**       | None         | Database clusters for Keycloak, Management Identity, and Camunda Hub |
| 2     | **[Elasticsearch](#elasticsearch-deployment)** | None         | Secondary storage for orchestration cluster components               |
| 3     | **[Keycloak](#keycloak-deployment)**           | PostgreSQL   | Authentication and identity management                               |
| 4     | **[Camunda](#camunda-deployment)**             | All above    | Deploy using Helm with operator-managed infrastructure               |

**Tip: Automation with GitOps**
While this guide demonstrates manual deployment using command-line tools, these same configurations can be automated using GitOps solutions like ArgoCD, Flux, or other Kubernetes deployment pipelines. All configuration files referenced in this guide are designed to work seamlessly with declarative deployment approaches.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
