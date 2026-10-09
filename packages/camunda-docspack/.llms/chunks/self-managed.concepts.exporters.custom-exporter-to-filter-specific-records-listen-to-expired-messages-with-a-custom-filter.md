# Camunda exporters — Custom exporter to filter specific records — Listen to expired messages with a custom filter

You can also create a custom filter to listen to expired messages. This can be useful if you want to take specific actions on messages that have expired, such as logging them or re-publishing them.

For example, if you want to allow exporting only message events with `EXPIRED` intent, follow the steps below:

1.  Implement the `RecordFilter` interface:

        ```java
        public class MessageExpiredExporterFilter implements RecordFilter {

        @Override
        public boolean acceptType(RecordType recordType) {
            return recordType == RecordType.EVENT;
        }

        @Override
        public boolean acceptValue(ValueType valueType) {
            return valueType == ValueType.MESSAGE;
        }

        @Override
        public boolean acceptIntent(Intent intent) {
            if (intent instanceof MessageIntent messageIntent) {
            return messageIntent == MessageIntent.EXPIRED;
            }

            return true;
        }
        }
        ```

**Note**
        This filter will only accept records of type `EVENT`, value type `MESSAGE`, and intent `EXPIRED`. To accept more record types, value types, and intents, modify the `acceptType`, `acceptValue`, and `acceptIntent` methods accordingly.

2.  Set the `MessageExpiredExporterFilter` filter in the `Exporter#configure` method of your custom exporter:

        ```java
        public class MessageExpiredExporter implements Exporter {

        // ...
        private Controller controller;

        @Override
        public void open(final Controller controller) {
            this.controller = controller;
            // ...
        }

        @Override
        public void configure(final Context context) {
            // ...
            context.setFilter(new MessageExpiredExporterFilter());
        }

        @Override
        public void export(final Record<?> record) {
            // ...
            // after handling the record, acknowledge the position
            controller.updateLastExportedRecordPosition(record.getPosition());
        }

        // ...
        }
        ```

**Info**
        Messages with zero TTL will also be exported with this filter. If a message with zero TTL is republished after expiration, it will immediately expire again, causing the exporter to receive it again.

        This creates an infinite loop of republishing and expiring the same message, potentially leading to the engine blocked from processing other records. To avoid this, check the message TTL before republishing it.

3.  (Optional) By default, the exporter will not receive the full message body, only the message key with the empty message body is exported. To receive the full message body with the expired message, enable it via YAML configuration or environment variable.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/exporters
