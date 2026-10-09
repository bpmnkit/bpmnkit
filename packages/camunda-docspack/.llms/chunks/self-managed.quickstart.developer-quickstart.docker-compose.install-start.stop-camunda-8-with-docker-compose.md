# Install and start with Docker Compose — Stop Camunda 8 with Docker Compose

To stop all containers and remove associated data, run:

```shell
docker compose down -v

# or for the full configuration:
docker compose -f docker-compose-full.yaml down -v

# or for standalone Camunda Hub:
docker compose -f docker-compose-hub.yaml down -v
```

**Caution**
The `-v` flag deletes all volumes, including process data, users, and other persisted state. Omit `-v` if you want to keep your data.


## Next steps

- Review [configure Docker Compose environments](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/configuration).
- Review [configure secondary storage with Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/secondary-storage).
- Review [use connectors and deploy processes with Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/connectors-and-modeling).

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/install-start
