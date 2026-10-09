# Deploy required dependencies with Kubernetes operators — Keycloak deployment — domain-openshift

Keycloak instance configured for OpenShift Routes.

**Save as** `keycloak-instance-domain-openshift.yml`:

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/operator-based/keycloak/keycloak-instance-domain-openshift.yml
```

**Use case**: [OpenShift](https://docs.redhat.com/en/documentation/openshift_container_platform/4.11/html/networking/configuring-routes) deployment using native Route resources.

#### Execution

1. **Navigate to Keycloak directory**: `cd ../keycloak/`
2. **Review deployment script**: `cat deploy.sh` to understand the deployment steps
3. **Review instance configuration**: `cat keycloak-instance-no-domain.yml` to verify Keycloak instance settings
4. **Adapt configuration if needed**: Choose appropriate instance configuration for your setup:
   - `keycloak-instance-no-domain.yml` for local development
   - `keycloak-instance-domain-contour.yml` for Contour
   - `keycloak-instance-domain-openshift.yml` for OpenShift Routes
5. **Execute deployment**: `./deploy.sh`

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
