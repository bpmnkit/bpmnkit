# Configure secondary storage in Camunda 8 Run — Switching between storage types and migration notes

- Switching the secondary storage type, for example H2 to Elasticsearch, does **not** preserve existing secondary-store data. The system starts with a fresh secondary store.
- To switch storage, update `data.secondary-storage` in `application.yaml` and restart Camunda 8 Run.

Choose **H2** for quick local development and other supported **RDBMS** or **Elasticsearch** for production-like scenarios.


## Primary vs. secondary storage

Camunda 8 uses two layers of storage:

- **[Primary storage](https://docs.camunda.io/docs/next/reference/glossary#primary-storage)** is handled by the Zeebe Broker to store workflow execution data.
- **[Secondary storage](https://docs.camunda.io/docs/next/reference/glossary#secondary-storage)** is used by applications like Operate, Tasklist, and Admin to read and present that data.

For more details on how these layers interact, see [secondary storage architecture](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index).

Camunda 8 Run uses v2 APIs by default, so you don't need to reconfigure the APIs when switching between secondary storage backends.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/secondary-storage
