# Kafka connector — Activate the Kafka Consumer connector by deploying your diagram

When you click the **Deploy** button, your Kafka Consumer is activated and starts consuming messages from the specified topic.


## Appendix and FAQ

### What mechanism is used to authenticate against Kafka?

If you selected _Credentials_ as the **Authentication type** and the fields **Username** and **Password** are not empty, by default the **Kafka Consumer connector** enables the credentials-based SASL SSL authentication, and sets the following properties:

```
sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule   required username='<Your Username>'   password='<Your Password>';
security.protocol=SASL_SSL
sasl.mechanism=PLAIN
```

If any of the field is not populated, you must configure your security method for your Kafka configuration. You can do this using the **Additional properties** field.

### What are default Kafka Consumer client properties?

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
  key.deserializer=org.apache.kafka.common.serialization.StringDeserializer
  value.deserializer=org.apache.kafka.common.serialization.StringDeserializer
  ```

- Miscellaneous properties:

  ```
  session.timeout.ms=45000
  client.dns.lookup=use_all_dns_ips
  acks=all
  group.id=kafka-inbound-connector-{{bpmnProcessId}}
  enable.auto.commit=false
  ```

**Caution**
The `group.id` value above is auto-generated when no explicit **Consumer Group ID** is configured in the connector. This generated ID is derived from the connector's internal deduplication key and can change across connector upgrades, including from 8.8 to 8.9. When the group ID changes, Kafka treats the connector as a new consumer group, which means committed offsets are not reused and messages may be replayed. To avoid this, always set an explicit **Consumer Group ID**. You can [look up existing consumer groups](https://docs.confluent.io/kafka/operations-tools/manage-consumer-groups.html#list-groups-and-view-offsets) to find the current group ID in use.

### What is the precedence of client properties loading?

Properties loading consists of three steps:

1. Construct client properties from the BPMN diagram: authentication, bootstrap server, message properties.
2. Load miscellaneous properties.
3. Load and **override** properties from the field **Additional properties**.

### How is the message payload deserialized?

As Kafka messages usually use JSON format, we first try to deserialize it as a `JsonElement`. If this fails (for example, because of a wrong format) we use the `String` representation of the original raw value. For convenience, we always store the original raw value as `String` in a different attribute.

The deserialized object structure:

```
{
  key: "String"
  rawValue: "String"
  value: {}
}
```

### When is the offset committed? What happens if the connector execution fails?

The following outcomes are possible:

- If the connector execution is successful and the **Activation condition** was met, the offset is committed.
- If the **Activation condition** was not met, the offset is also committed to prevent consuming the same message twice.
- If the connector execution fails due to an unexpected error (for example, Zeebe is unavailable), the offset is not committed.

### What lifecycle does the Kafka Consumer connector have?

The Kafka Consumer connector is a long-running connector that is activated when the process is deployed, and deactivated when the process is undeployed or overwritten by a new version.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/kafka
