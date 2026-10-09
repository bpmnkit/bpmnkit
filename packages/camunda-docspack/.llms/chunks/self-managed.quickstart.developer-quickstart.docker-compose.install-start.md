# Install and start with Docker Compose

Download the Docker Compose distribution, start Camunda 8 locally, and stop the environment when you are done.

Use this page to install the Docker Compose distribution locally, start Camunda 8, and stop the environment cleanly.


## Prerequisites

The following prerequisites are required to run Camunda 8 Self-Managed with Docker Compose:

| Prerequisite   | Description                                                                              |
| :------------- | :--------------------------------------------------------------------------------------- |
| Docker Compose | Version 2.24.0 or later, which supports the Compose attributes used by the distribution. |
| Docker         | Version 20.10.16 or later.                                                               |

**Tip**
If Docker Compose reports errors such as unsupported attributes when loading the Camunda Compose files, confirm that you are using the Docker Compose v2 plugin:

```shell
docker compose version
```

Run the commands in this guide with `docker compose`, not `docker-compose`. Confirm the output reports version 2.24.0 or later. If needed, upgrade Docker Desktop or the Docker Engine Compose plugin, then retry.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/install-start
