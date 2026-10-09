# Camunda exporters — Custom exporter to filter specific records — valuesYaml

```yaml
        zeebe:
        broker:
            experimental:
            features:
                enableMessageBodyOnExpired: true
        ```

        
        

**Caution**

        Enabling the full message body for expired messages can impact the performance of message expiration.

        - When this feature flag is enabled, every deleted message is appended to the Zeebe engine's record stream **including the full message body**.

        - Because each expired message now carries its entire payload, the expiration checker's write buffer fills up faster. As a result, the checker requires more time (or more roundtrips) to process the same number of expired messages.

        - This can lead to an increasing backlog of messages waiting to be expired. For finer control over the expiration checker's behavior, see the [message TTL checker configuration](https://github.com/camunda/camunda/blob/main/dist/src/main/config/defaults.yaml) (`enable-async-message-ttl-checker`).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/exporters
