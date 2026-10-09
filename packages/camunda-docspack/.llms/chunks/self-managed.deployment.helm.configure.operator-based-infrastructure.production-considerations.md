# Deploy required dependencies with Kubernetes operators — Production considerations

### Security

- **Network policies**: Implement network policies to restrict traffic between components. See [required network traffic](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index#required-network-traffic).
- **TLS encryption**: Enable TLS for all inter-component communication
- **Secret management**: Use external secret management systems in production
- **RBAC**: Configure proper role-based access control for infrastructure and applications

### Backup and disaster recovery

- **Elasticsearch**: Perform backups using Camunda for Elastic (see [Camunda backup guide](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup)).
- **PostgreSQL**: Configure automated backups using [CloudNativePG's backup capabilities](https://cloudnative-pg.io/docs/1.30/recovery)
- **Keycloak**: Configure regular [exports of realm and user data](https://www.keycloak.org/server/importExport)
- **Configuration**: Store all configuration files in version control

### Monitoring and observability

- **Metrics**: Enable Prometheus monitoring for all infrastructure components
- **Logging**: Aggregate logs from infrastructure and application components
- **Alerting**: Set up alerts for critical infrastructure events

### Resource planning

- **CPU and memory**: Size clusters based on expected workload
- **Storage**: Plan for data growth and I/O requirements
- **Network**: Consider bandwidth requirements between components

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
