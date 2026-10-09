# Configure secondary storage with Docker Compose — Switch between RDBMS, Elasticsearch, and OpenSearch

For a document-store backend, add the backend settings to `docker-compose.override.yaml`. The environment variables override the secondary storage settings in either application configuration file.

**Note**
These examples change the Orchestration Cluster secondary storage only. In the full setup, Optimize always requires Elasticsearch. The Elasticsearch example can serve both Orchestration and Optimize. If Orchestration uses OpenSearch, Optimize continues to use the Elasticsearch service that the full configuration starts.

**Note**
In the full setup, `.orchestration/application.yaml` also pins the webapp database keys `camunda.database.type`, `camunda.operate.database`, and `camunda.tasklist.database` to `rdbms`. Update those keys in that file to match the backend you select, otherwise Operate and Tasklist keep their RDBMS wiring after you switch. The lightweight `configuration/` files do not set these keys, so the environment overrides below are sufficient there.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/secondary-storage
