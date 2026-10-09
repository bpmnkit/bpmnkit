# Install and start with Docker Compose — Install and start Camunda 8 with Docker Compose

To start the default lightweight Camunda 8 Self-Managed environment locally:

1. Download the Camunda 8 Docker Compose archive (a `.zip` file from the [Camunda Distributions releases](https://github.com/camunda/camunda-distributions/releases) on GitHub), then extract it. Keep the complete directory, including `.env`, hidden configuration directories, and `configuration/`.
1. In the extracted directory, run:

   ```shell
   docker compose up -d
   ```

1. Wait for the environment to initialize. This can take several minutes. Run `docker compose ps` to check service health, or `docker compose logs -f orchestration connectors` to follow the lightweight startup.

Run Compose commands from the extracted directory. If Compose reports that image-version variables are unset or `.env` is missing, download and extract the complete distribution archive again instead of downloading an individual Compose file.

For available Compose files, component URLs, and authentication defaults, see [configure Docker Compose environments](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/configuration).

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/install-start
