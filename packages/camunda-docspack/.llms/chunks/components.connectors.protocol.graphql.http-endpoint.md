# GraphQL connector — HTTP endpoint

Under the **HTTP Endpoint** section, fill in the **URL** with your desired endpoint and select the desired **Method**.


## GraphQL query

### Query/Mutation

Insert your query or mutation you wish to execute here. This must be a syntactically valid instruction. For more details, see [the official documentation](https://graphql.org/learn/queries/).

You can use [arguments](https://graphql.org/learn/queries/#arguments), [aliases](https://graphql.org/learn/queries/#aliases), [directives](https://graphql.org/learn/queries/#directives), and [fragments](https://graphql.org/learn/queries/#fragments) as well.
For example:

```text
query Root($id: ID) {
 person (id: $id) {
  id
  name
 }
}
```

**Note**
Secrets are currently not supported in the **Query/Mutation** of a GraphQL connector.

**Note**
You can test your queries on publicly available GraphQL API [here](https://studio.apollographql.com/public/star-wars-swapi/home?variant=current).

#### Example

```text
query Query {
  allFilms {
    films {
      title
      director
      releaseDate
      speciesConnection {
        species {
          name
          classification
        }
      }
    }
  }
}
```

### Variables

You can specify [variables](https://graphql.org/learn/queries/#variables) to your queries/mutations.

The **Variables** field can be configured using the [FEEL Map](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-data-types#context) data type.

```text
= {
    "id": "{{secrets.GRAPHQL_ENTITY_ID}}",
    "includeDroids": false,
}
```

**Note**
Secrets are not like regular variables and must be wrapped in double quotes (`"`) when used in an expression.

#### Example

Query:

```text
query Root($id: ID, $includeGender: Boolean!) {
  person (id: $id) {
    name,
    height,
    gender @include(if: $includeGender)
  }
}
```

Variables:

```text
{
  "id": "cGVvcGxlOjI=",
  "includeGender": false
}
```

### Network communication timeouts

- **Connection timeout in seconds** determines the time frame in which the client will try to establish a connection with the server. If you do not specify a value, the system uses the default of 20 seconds. For cases where you need to wait indefinitely, set this value to 0.

- **Read timeout in seconds** is the amount of time the client will wait to read data from the server after the connection has been made. The default is also set to 20 seconds. To allow an unlimited wait time for slow responses, set this to 0.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/graphql
