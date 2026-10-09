# Kafka connector — Configure your Kafka Consumer connector — Example Avro schema and data

If the expected Kafka message looks like this:

- **Key**: `employee1`
- **Value**:

  ```json
  {
    "name": "John Doe",
    "age": 29,
    "emails": ["johndoe@example.com"]
  }
  ```

The corresponding Avro schema to describe this message's structure would be:

```json
{
  "doc": "Sample schema to help you get started.",
  "fields": [
    {
      "name": "name",
      "type": "string"
    },
    {
      "name": "age",
      "type": "int"
    },
    {
      "name": "emails",
      "type": {
        "items": "string",
        "type": "array"
      }
    }
  ],
  "name": "sampleRecord",
  "namespace": "com.mycorp.mynamespace",
  "type": "record"
}
```

This schema defines a structure for a record that includes a name (string), an age (integer), and emails (an array of strings), aligning with the given Kafka message's value format.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka
