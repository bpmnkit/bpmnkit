# Email connector — POP3 — Search Emails

Enable users to perform advanced searches within an email inbox, by constructing a criteria-based query using a JSON
object. Supports complex queries that can combine multiple conditions using logical operators.

#### Parameters

A search query is represented as a JSON object. The following is an example of a JSON object that represents a search
criteria
using an AND and OR operator to combine multiple conditions:

```json
{
  "operator": "AND",
  "criteria": [
    {
      "field": "FROM",
      "value": "example@camunda.com"
    },
    {
      "operator": "OR",
      "criteria": [
        {
          "field": "SUBJECT",
          "value": "urgent"
        },
        {
          "field": "SUBJECT",
          "value": "important"
        }
      ]
    }
  ]
}
```

This example query returns emails from "example@camunda.com" with a subject containing either "urgent" or "important".

A simpler query without logical operators might look like the following example:

```json
{
  "field": "FROM",
  "value": "example@camunda.com"
}
```

Search supports the following logical operators:

- **AND**: Returns emails that match **all** the specified criteria.
- **OR**: Returns emails that match **any of** the specified criteria.

The following email fields can be used to set search criteria:

- **BODY**: The content of the email body.
- **SUBJECT**: The subject line of the email.
- **FROM**: The email address of the sender.

**Note**

When using an operator such as AND or OR, you must also define a criteria array. This array contains the individual
conditions that the search will evaluate against the emails. Each condition within the criteria array is itself a JSON
object with a field and a value.

- If an operator is set, the criteria array must also be defined.
- Each criterion within the criteria array is applied to the specified field based on the value associated with it.

#### Response Structure

- `subject`: The email subject line.
- `messageId`: The identifier of the email message that was attempted to be deleted.

**Note**
As of the 8.8 release, angle brackets (`<` and `>`) are no longer removed from the `messageId`.

#### Example Response

The following is an example of a returned response:

```json
[
  { "messageId": "MessageId", "subject": "Important" },
  { "messageId": "MessageId2", "subject": "Urgent" }
]
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/email-outbound
