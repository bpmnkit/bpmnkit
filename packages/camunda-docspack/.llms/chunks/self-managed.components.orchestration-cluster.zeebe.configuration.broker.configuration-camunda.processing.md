# Broker configuration — Configuration — camunda.processing

| Field                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Example Value |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| max-commands-in-batch | Sets the maximum number of commands processed within one batch. The processor continues until no more follow-up commands are created by the initial command or the configured limit is reached. By default, up to `100` commands are processed in one batch. Set to `1` to disable batch processing. Must be a positive integer. Note that the resulting batch size can contain more entries than this limit because it includes follow-up events. When the resulting batch size is too large, processing is rolled back and retried with a smaller maximum batch size. Lowering the command limit can reduce the frequency of rollback and retry. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_MAXCOMMANDSINBATCH`. | 100           |

#### YAML snippet

```yaml
camunda:
  processing:
    max-commands-in-batch: 100
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
