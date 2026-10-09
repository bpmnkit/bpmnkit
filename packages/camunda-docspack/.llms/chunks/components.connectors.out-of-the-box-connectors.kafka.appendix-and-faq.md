# Kafka connector — Appendix and FAQ

### What mechanism is used to authenticate against Kafka?

If the fields **Username** and **Password** are not empty, by default the **Kafka Producer connector** enables the credentials-based SASL SSL authentication and the following properties are set:

```
sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule   required username='<Your Username>'   password='<Your Password>';
security.protocol=SASL_SSL
sasl.mechanism=PLAIN
```

If any of the fields are not populated, you must configure your security method for your Kafka configuration. You can do this using the **Additional properties** field.

### What are default Kafka Producer client properties?

- Authentication properties (only if both **Username** and **Password** are not empty):

  ```
  sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule   required username='<Your Username>'   password='<Your Password>';
  security.protocol=SASL_SSL
  sasl.mechanism=PLAIN
  ```

- Bootstrap server property:

  ```
  bootstrap.servers=<bootstrap server(s) from BPMN>
  ```

- Message properties:

  ```
  key.serializer=org.apache.kafka.common.serialization.StringSerializer
  value.serializer=org.apache.kafka.common.serialization.StringSerializer
  ```

- Miscellaneous properties:

  ```
  session.timeout.ms=45000
  client.dns.lookup=use_all_dns_ips
  acks=all
  delivery.timeout.ms=45000
  ```

### What is the precedence of client properties loading?

Properties loading consists of three steps:

1. Construct client properties from the BPMN diagram: authentication, bootstrap server, message properties.
2. Load miscellaneous properties.
3. Load and **override** properties from the field **Additional properties**.

### How do I set or override additional client properties?

The following example sets a new client property `client.id` and overrides the SASL mechanism to `SCRAM SHA-256` instead of plain text:

```
= {
  "client.id":"MyDemoClientId",
  "sasl.mechanism":"SCRAM-SHA-256"
}
```

The **Kafka Consumer connector** allows you to consume messages by subscribing to [Kafka](https://kafka.apache.org/) topics and mapping them to your BPMN processes as start or intermediate events.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka
