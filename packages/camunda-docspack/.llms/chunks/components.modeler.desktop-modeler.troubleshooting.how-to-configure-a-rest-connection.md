# Troubleshooting — How to configure a REST connection

You try out [task testing](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/task-testing) and Desktop Modeler tells you "Configure a REST connection to Camunda 8."

Some features of Desktop Modeler, such as task testing, require a REST connection to Camunda 8. Orchestration clusters from version 8.6 support connections with gRPC or the newer [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview). Depending on the provided URL, the corresponding client will be used. Ensure you use the REST URL in your deployment configuration:

- If you are using Camunda 8 SaaS clusters, create an [API client](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients) and use the value of `Camunda REST API`.
- If you are using [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run), you should use the value of `Orchestration Cluster API`.

**Tip**
Even if the URL starts with `http://`, it may still be a gRPC endpoint. Ensure you use the correct URL provided by your orchestration cluster.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/troubleshooting
