# Configure Docker Compose environments — Access components

Once the containers are running, you can access the components in your browser.

Use the following default credentials for web interfaces:

- **Username:** `demo`
- **Password:** `demo`

### Orchestration Cluster

The Orchestration Cluster is the core of Camunda 8 and provides process automation capabilities.

| Component                      | URL                                                              | Description                                                                                                                                                                                                |
| :----------------------------- | :--------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operate                        | [http://localhost:8080/operate](http://localhost:8080/operate)   | Monitor and troubleshoot process instances. See [Introduction to Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction) and [Process instance creation](https://docs.camunda.io/docs/next/components/concepts/process-instance-creation). |
| Tasklist                       | [http://localhost:8080/tasklist](http://localhost:8080/tasklist) | Complete user tasks in running process instances. See [User tasks](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks).                                                                                     |
| Orchestration Cluster Admin    | [http://localhost:8080/admin](http://localhost:8080/admin)       | Manage users and permissions in the lightweight configuration.                                                                                                                                             |
| Orchestration Cluster REST API | `http://localhost:8080/v2`                                       | REST API for process automation.                                                                                                                                                                           |
| Orchestration Cluster gRPC API | `localhost:26500`                                                | gRPC API for high-performance process automation.                                                                                                                                                          |

### Management and modeling components

The following components are available in the full configuration only:

| Component           | URL                                            | Description                                                                                                                                                                                       |
| :------------------ | :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Optimize            | [http://localhost:8083](http://localhost:8083) | [Analyze and improve](https://docs.camunda.io/docs/next/components/optimize/what-is-optimize) process performance.                                                                                                              |
| Management Identity | [http://localhost:8084](http://localhost:8084) | [Manage users](https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview) for Camunda Hub and Optimize.                                                                                            |
| Camunda Hub         | [http://localhost:8070](http://localhost:8070) | Manage clusters and model [BPMN](https://docs.camunda.io/docs/next/components/modeler/bpmn/bpmn) processes, [DMN](https://docs.camunda.io/docs/next/components/modeler/dmn/dmn) decisions, and [forms](https://docs.camunda.io/docs/next/components/modeler/forms/camunda-forms-reference). |

### External dependencies

| Component     | Configuration | URL                                                          | Description                                                                                                                                                                                                           |
| :------------ | :------------ | :----------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Elasticsearch | Full          | [http://localhost:9200](http://localhost:9200)               | Started by the full configuration. Used by Optimize and the Orchestration Cluster's `elasticsearch` exporter. Point the `ELASTICSEARCH_*` values in `.env` at another endpoint to use an externally managed instance. |
| Keycloak      | Full          | [http://localhost:18080/auth/](http://localhost:18080/auth/) | OIDC provider for Management Identity. The lightweight configuration uses the embedded Orchestration Cluster Admin instead. Access Keycloak with `admin` / `admin`.                                                   |
| PostgreSQL    | Full          | Internal only                                                | Database for Management Identity and Camunda Hub. This database is separate from Orchestration Cluster secondary storage.                                                                                             |

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/configuration
