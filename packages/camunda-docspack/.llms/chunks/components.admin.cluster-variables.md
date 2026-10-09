# Cluster variables

Manage configuration values centrally across your cluster using the Admin UI.

Use Admin to manage cluster variables, which store configuration values centrally across your cluster and make them available in [FEEL expressions](https://docs.camunda.io/docs/next/components/modeler/feel/cluster-variable/overview).


## About cluster variables

Cluster variables allow you to maintain environment-specific configurations, API endpoints, feature flags, and other shared values without hardcoding them into individual process definitions. Variables can be defined at the global (cluster-wide) or tenant level.

Each variable also has a kind, either `JSON` or `SECRET_REFERENCE`, which determines how Camunda reads its value. `JSON` is the default. See [variable kinds](https://docs.camunda.io/docs/next/components/modeler/feel/cluster-variable/data-types#variable-kinds).

**Tip**
To learn more about cluster variables, including scope resolution, data types, and FEEL expression usage, see the [cluster variables overview](https://docs.camunda.io/docs/next/components/modeler/feel/cluster-variable/overview).

You can manage cluster variables through the Admin UI or the [Orchestration Cluster API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-global-cluster-variable.api).

---
Source: https://docs.camunda.io/docs/next/components/admin/cluster-variables
