# Deploy required dependencies with Kubernetes operators — Migration from subcharts

If you're migrating from existing Bitnami sub-chart deployments:

1. **Export data**: Create backups of existing databases and Elasticsearch indices
2. **Deploy operator-based infrastructure**: Install the operator-managed infrastructure alongside existing deployment
3. **Migrate data**: Transfer data to operator-managed services
4. **Update configuration**: Switch Camunda configuration to use new services
5. **Cleanup**: Remove old sub-chart deployments once migration is complete


## Additional resources

- [CloudNativePG documentation](https://cloudnative-pg.io/docs/1.30/)
- [Elastic Cloud on Kubernetes guide](https://www.elastic.co/guide/en/cloud-on-k8s/current/index.html)
- [Keycloak Operator documentation](https://www.keycloak.org/operator/installation)
- [Camunda 8 Helm chart parameters](https://artifacthub.io/packages/helm/camunda/camunda-platform#parameters)
- [Kubernetes Operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure
