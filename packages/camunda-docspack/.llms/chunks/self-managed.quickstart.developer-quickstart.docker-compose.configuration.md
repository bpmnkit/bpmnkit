# Configure Docker Compose environments

Choose the Docker Compose file that matches your local setup, access components, and review authentication defaults.

Use this page to choose the Docker Compose file that matches your local setup, find component URLs, and review authentication defaults.


## Choose a Docker Compose configuration

Camunda provides three Docker Compose configurations in the [Camunda Distributions releases](https://github.com/camunda/camunda-distributions/releases):

| Configuration file         | Description                                                                                                                                                                                                                                             |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docker-compose.yaml`      | Default lightweight configuration. Includes the Orchestration Cluster and Connectors, and uses H2 secondary storage by default. Use this for most local development scenarios.                                                                          |
| `docker-compose-full.yaml` | Full configuration. Includes the Orchestration Cluster, Connectors, Optimize, Camunda Hub, Management Identity, Keycloak, PostgreSQL, and Elasticsearch. Use this when you need management components, process optimization, or browser-based modeling. |
| `docker-compose-hub.yaml`  | Standalone Camunda Hub configuration. Runs Camunda Hub and its dependencies without an Orchestration Cluster. For deployment details, see [deploy with Camunda Hub](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/connectors-and-modeling#deploy-with-camunda-hub).                              |

To start a specific configuration, run one of the following commands:

- Default lightweight configuration:

  ```shell
  docker compose up -d
  ```

- Full configuration:

  ```shell
  docker compose -f docker-compose-full.yaml up -d
  ```

- Standalone Camunda Hub:

  ```shell
  docker compose -f docker-compose-hub.yaml up -d
  ```

**Note**
The Orchestration Cluster uses file-based H2 secondary storage by default. The PostgreSQL containers in the full configuration store Management Identity and Camunda Hub data, not Orchestration Cluster data. The full configuration starts Elasticsearch for Optimize.

To select another Orchestration Cluster backend, see [configure secondary storage with Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/secondary-storage).

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/configuration
