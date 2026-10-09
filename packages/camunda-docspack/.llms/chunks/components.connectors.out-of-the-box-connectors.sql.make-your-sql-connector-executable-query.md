# SQL connector — Make your SQL connector executable — Query

**Note**
You should pay extra attention to the query you are executing. Make sure it is safe and does not expose your database to SQL injection attacks.
Use **[variables](#variables)** as much as possible to prevent SQL injection attacks.

| Property                          | Type                                                                                                                                                    | Required                 | Description                                                                                                                                                                                                                                                                                      | Example                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| [Return results](#return-results) | Boolean                                                                                                                                                 | Yes (default is `false`) | If the query should return results (when using `SELECT` or `RETURNING`), set this field to `true`. Otherwise (insert, update, delete, create table or database), leave the checkbox unchecked.This property will **change** the response type.See the details [here](#return-results). | `true`                                       |
| [Query](#query-description)       | String                                                                                                                                                  | Yes                      | The SQL query you want to execute.See the details [here](#query-description).                                                                                                                                                                                                               | `SELECT * FROM mytable WHERE field = :field` |
| [Variables](#variables)           | [List](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-data-types#list) or [object](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-data-types#context) | No                       | Variables that can be used in the query.See the details [here](#variables).                                                                                                                                                                                                                 | `={field: "theFieldValue"}`, `=[24]`         |

#### Return results

- When `false`, the response (see the [output](#what-is-the-output-format-of-the-sql-connector) section) will consist of an object containing an integer (`modifiedRows`) representing the number of modified rows. This is applicable for:
  - `INSERT`
  - `UPDATE`
  - `DELETE`

This will return `0` for:

- `CREATE TABLE`
- `CREATE DATABASE`, except for MySQL, where it will return `1`

- When `true`, the response will be a list of objects. This list will contain the results of the `SELECT` query.For instance, `SELECT * FROM mytable`, where `mytable` is a table with columns' `name` and `age`, will return:

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

#### Query {#query-description}

The query you want to execute. We currently support the following SQL queries:

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`
- `CREATE TABLE`
- `CREATE DATABASE`

The query might contain variables that can be used in the query, and we recommend using them as a best practice to prevent SQL injection attacks. See the [variables](#variables) section for more details.

#### Variables

Variables need to be provided as a list or an object. We provide three ways to use variables in your query:

| Type                  | Query example                                                                                                                                   | Variables example                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Named parameters      | `SELECT * FROM mytable WHERE field = :field``INSERT INTO Employee (id, name, age, department) VALUES (:id, :name, :age, :department)` | `={field: "theFieldValue"}``={id: 1, name: "John", age: 34, department: "Dept"}` |
| Positional parameters | `SELECT * FROM mytable WHERE field = ?``INSERT INTO Employee (id, name, age, department) VALUES (?, ?, ?, ?)`                         | `=["theFieldValue"]``=[1, "John", 34, "Dept"]`                                   |
| List parameters       | `SELECT * FROM mytable WHERE field IN (<listField>)`                                                                                            | `={listField: ["val1", "val2"]}`                                                           |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/sql
