# Camunda exporters — Custom exporter to filter specific records

The exporter interface supports record filtering through the [`Context#RecordFilter`](https://github.com/camunda/camunda/blob/main/zeebe/exporter-api/src/main/java/io/camunda/zeebe/exporter/api/context/Context.java) interface.

At a high level, filtering happens in two phases:

- Metadata-level filtering via `acceptType`, `acceptValue`, and `acceptIntent`, which runs before records are deserialized and is very cheap.
- Record-level filtering via `acceptRecord(Record<?>)`, which can inspect the fully deserialized record value when you need richer conditions (for example, inspecting variables or BPMN process IDs).

Valid record types and value types can be found in the [protocol definition](https://github.com/camunda/camunda/blob/main/zeebe/protocol/src/main/resources/protocol.xml), while intents are listed in the [Intent enum class](https://github.com/camunda/camunda/blob/main/zeebe/protocol/src/main/java/io/camunda/zeebe/protocol/record/intent/Intent.java).

For example, you can implement a custom exporter that only exports records with:

- Record type: `EVENT`
- Value type: `JOB`
- Intent: `CREATED`

```java
public class CustomExporterFilter implements RecordFilter {

  @Override
  public boolean acceptType(RecordType recordType) {
    return recordType == RecordType.EVENT;
  }

  @Override
  public boolean acceptValue(ValueType valueType) {
    return valueType == ValueType.JOB;
  }

  @Override
  public boolean acceptIntent(Intent intent) {
    return intent == JobIntent.CREATED;
  }
}
```

You can then set this filter in the `Exporter#configure` method of your custom exporter:

```java
public class CustomExporter implements Exporter {

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
    context.setFilter(new CustomExporterFilter());
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

**Note**

- After handling the record, you must acknowledge the position by calling `controller.updateLastExportedRecordPosition(record.getPosition())`.
  Because the stream is an ordered sequence of records with monotonically increasing positions, tracking the position is sufficient.
  Exporters set this position once they can ensure the corresponding record was exported successfully.
- All filter methods are combined with logical `AND`.
  A record is exported only if it passes `acceptType`, `acceptValue`, `acceptIntent`, and (when implemented) `acceptRecord`.
  In simple cases you can implement only the metadata methods; use `acceptRecord` when you need to inspect full record values.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/exporters
