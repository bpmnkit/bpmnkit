# Configure secondary storage with Docker Compose

Configure RDBMS, Elasticsearch, or OpenSearch as secondary storage for the Orchestration Cluster in Docker Compose.

<!-- markdownlint-disable MD033 -->

Use this page to configure secondary storage for the Orchestration Cluster in the Docker Compose quickstart.


## Choose a database configuration path

Camunda 8.10 uses different application configuration files for the lightweight and full Docker Compose setups.

| Setup                             | Default secondary storage | Select another backend                                                                                                                                                                 |
| :-------------------------------- | :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lightweight `docker-compose.yaml` | File-based H2             | Set `ORCHESTRATION_CONFIG_FILE` to a file from `configuration/`, then edit that file for your database connection.                                                                     |
| Full `docker-compose-full.yaml`   | File-based H2             | Replace the `camunda.data.secondary-storage` settings in `.orchestration/application.yaml` with the matching block from the file in `configuration/`, then edit the connection values. |

The full setup also starts Elasticsearch for Optimize. The PostgreSQL containers in the full setup store Management Identity and Camunda Hub data; they do not store Orchestration Cluster data.

**Warning**
Do not replace `.orchestration/application.yaml` in the full setup with a file from `configuration/`. The files in `configuration/` use the lightweight setup's Basic authentication settings. Replacing the full file removes its OpenID Connect (OIDC) and component configuration.

Use this workflow for each backend:

1. Select the matching application file and database service from the table below.
1. Configure the application file for your setup:
   - **Lightweight setup:** Edit the selected `configuration/application-<database>.yaml` file and set `ORCHESTRATION_CONFIG_FILE` to its filename.
   - **Full setup:** Replace the `camunda.data.secondary-storage` block in `.orchestration/application.yaml` with the block from the selected file, then edit the copied values there.
1. Create `docker-compose.override.yaml` in the extracted distribution directory and copy the matching database service example into it.
1. If the backend requires an external JDBC driver, place the driver JAR directly in `driver-lib/`.
1. Start the setup with the command shown for that backend.

| Backend              | Application file              | Hostname from the override | JDBC driver                                     |
| :------------------- | :---------------------------- | :------------------------- | :---------------------------------------------- |
| H2                   | `application-h2.yaml`         | Not applicable             | Included                                        |
| PostgreSQL           | `application-postgresql.yaml` | `postgres-secondary`       | Included                                        |
| MariaDB              | `application-mariadb.yaml`    | `mariadb-secondary`        | Included                                        |
| MySQL                | `application-mysql.yaml`      | `mysql-secondary`          | Add the MySQL Connector/J JAR to `driver-lib/`  |
| Oracle               | `application-oracle.yaml`     | `oracle-secondary`         | Add the Oracle JDBC driver JAR to `driver-lib/` |
| Microsoft SQL Server | `application-mssql.yaml`      | `mssql-secondary`          | Included                                        |

When the database runs from `docker-compose.override.yaml`, replace `localhost` in the selected JDBC URL with the hostname shown in the table. The MySQL file uses host port `3307` by default; container-to-container traffic uses MySQL port `3306` instead.

**Note**
Camunda configures the built-in exporter automatically from `camunda.data.secondary-storage.*`. You do not need to add a separate exporter class for the standard Docker Compose quickstart.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/secondary-storage
