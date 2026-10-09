# Databricks connector — Choose an API and operation

In the **Databricks API** dropdown list, select the API you want to call. In the **Operation** dropdown list, select one of the operations supported for that API. The workspace URL, endpoint path, HTTP method, and query parameters are derived automatically from this choice; only the fields the selected operation needs are shown.

| API                     | Operation                         | Request                                                                  |
| ----------------------- | --------------------------------- | ------------------------------------------------------------------------ |
| SQL Statement Execution | Execute statement                 | `POST /api/2.0/sql/statements`                                           |
| SQL Statement Execution | Get statement status and result   | `GET /api/2.0/sql/statements/{statement_id}`                             |
| SQL Statement Execution | Get result chunk                  | `GET /api/2.0/sql/statements/{statement_id}/result/chunks/{chunk_index}` |
| SQL Statement Execution | Cancel statement                  | `POST /api/2.0/sql/statements/{statement_id}/cancel`                     |
| SQL Warehouses          | Get warehouse                     | `GET /api/2.0/sql/warehouses/{id}`                                       |
| SQL Warehouses          | Start warehouse                   | `POST /api/2.0/sql/warehouses/{id}/start`                                |
| SQL Warehouses          | Stop warehouse                    | `POST /api/2.0/sql/warehouses/{id}/stop`                                 |
| Jobs                    | Run job now                       | `POST /api/2.2/jobs/run-now`                                             |
| Jobs                    | Get run                           | `GET /api/2.2/jobs/runs/get`                                             |
| Jobs                    | Get run output                    | `GET /api/2.2/jobs/runs/get-output`                                      |
| Jobs                    | Cancel run                        | `POST /api/2.2/jobs/runs/cancel`                                         |
| Model Serving           | Invoke chat / LLM endpoint        | `POST /serving-endpoints/{name}/invocations`                             |
| Model Serving           | Invoke custom model (raw payload) | `POST /serving-endpoints/{name}/invocations`                             |
| Model Serving           | Get endpoint                      | `GET /api/2.0/serving-endpoints/{name}`                                  |
| Vector Search           | Query index                       | `POST /api/2.0/vector-search/indexes/{index_name}/query`                 |

**Note**
Model Serving invocations are the only requests without an `/api/2.0` prefix. Every other operation, including **Get endpoint**, is prefixed.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/databricks/databricks
