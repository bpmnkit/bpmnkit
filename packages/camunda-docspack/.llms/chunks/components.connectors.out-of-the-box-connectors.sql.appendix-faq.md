# SQL connector — Appendix & FAQ

### How do I store secrets for my connector?

Use secrets to avoid exposing your credentials. Follow our documentation on [managing secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets) to learn more.

### What is the output format of the SQL connector?

Depending on the type of query you execute, the response will contain either the number of modified rows (an object with a `modifiedRows` attribute) or the result set (an object with a `resultSet` attribute).

- If the query **doesn't return results** (insert, update, delete, create table or database), the response will consist of an integer representing the number of modified rows. See the [return results](#return-results) section for more details.

  In this case, the response will look like this:

  ```json
  {
    "modifiedRows": 1
  }
  ```

- If the query is a `SELECT` query (or uses the `RETURNING` keyword), the response will be an object with a `resultSet` property (as a list). This list will contain the results of the `SELECT` query as explained in the [return results](#return-results) section.
  For instance, `SELECT * FROM mytable`, where `mytable` is a table with columns' `name` and `age`, will return:
  ```json
  {
    "resultSet": [
      {
        "name": "John Doe",
        "age": 29
      },
      {
        "name": "Jane Doe",
        "age": 27
      }
    ]
  }
  ```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/sql
