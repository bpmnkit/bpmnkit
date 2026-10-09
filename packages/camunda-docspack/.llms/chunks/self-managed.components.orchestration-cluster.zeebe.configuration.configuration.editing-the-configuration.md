# Configuration — Editing the configuration

You can either start from scratch or start from the configuration templates listed above.

If you use a configuration template and want to uncomment certain lines, make sure to also uncomment their parent elements:

```yaml
Valid Configuration

    zeebe:
      gateway:
        network:
          # host: 0.0.0.0
          port: 26500

Invalid configuration

    # zeebe:
      # gateway:
        # network:
          # host: 0.0.0.0
          port: 26500
```

Uncommenting individual lines is a bit finicky, because YAML is sensitive to indentation. The best way to do it is to position the cursor before the `#` character and delete two characters (the dash and the space). Doing this will consistently give you a valid YAML file.

When it comes to editing individual settings, two data types are worth mentioning:

- Data size (e.g. `logSegmentSize`)
  - Human-friendly format: `500MB` (or `KB, GB`)
  - Machine-friendly format: size in bytes as long
- Timeouts/intervals (e.g. `requestTimeout`)
  - Human-friendly format: `15s` (or `m, h`)
  - Machine-friendly format: either duration in milliseconds as long, or [ISO-8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) format (e.g. `PT15S`)

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/configuration
