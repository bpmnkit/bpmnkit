# Email connector — POP3 — List Emails

Allow users to fetch a list of emails from the `INBOX` folder, with customizable sorting and limitation options.

#### Parameters

| Parameter            | Description                                                                                                                                                                                                                                       |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Max Emails to read` | Specify the maximum number of emails to retrieve. This parameter determines the cap on the number of emails the task will return.                                                                                                                 |
| `Sort emails by`     | Choose the field by which to sort the emails. Supported sorting fields are:`Sent date`: Sorts emails by the date and time they were sent.`Size`: Sorts emails by the size of the email.                  |
| `Sort order`         | Define the sort order:`ASC`: Ascending order, from the oldest or smallest value to the most recent or largest.`DESC`: Descending order, from the most recent or largest value to the oldest or smallest. |

#### Sorting and Limiting Behavior

Emails are initially sorted based on the specified sorting field and order. The list is then limited to the number of
emails as defined by the Max Emails to read parameter. For example, if you sort by Sent date in descending order (DESC)
with a limit of one email, the task will return the most recently sent email.

#### Response Structure

The task returns a list of emails in JSON format. Each email object contains the following information:

- `messageId`: A unique identifier for the email message.
- `fromAddress`: The email addresses of the sender.
- `subject`: The subject line of the email.
- `size`: The size of the email (in bytes).

**Note**
As of the 8.8 release, angle brackets (`<` and `>`) are no longer removed from the `messageId`.

#### Example Response

Example of a returned JSON array:

```json
[
  {
    "messageId": "RandomId",
    "fromAddress": "msa@communication.microsoft.com",
    "subject": "Example",
    "size": 99865
  },
  {
    "messageId": "RandomId2",
    "fromAddress": "example@camunda.com",
    "subject": "Example",
    "size": 48547
  }
]
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/email-outbound
