# Configure component configuration — Troubleshooting

### Conflicting options

If both an environment variable and a configuration file define the same option, the environment variable takes precedence.

Example:

```yaml
zeebe:
  env:
    - name: ZEEBE_BROKER_DATA_BACKUP_S3_BUCKETNAME
      value: "zeebetest1"

  configuration: |
    zeebe:
      broker:
        data:
          backup:
            s3:
              bucketName: "zeebeOtherBucketName"
      ...
```

Here, the bucket name is set twice. The environment variable `zeebetest1` overrides the configuration file `zeebeOtherBucketName`. See [Spring externalized configuration](https://docs.spring.io/spring-boot/docs/1.5.6.RELEASE/reference/html/boot-features-external-config.html) for precedence details.

### Limitations

Setting the `configuration` option replaces the entire contents of the application's configuration file. During upgrades, if the `configuration` option remains and there are breaking changes to the configuration file format or required defaults, this can prevent the component from starting.

- Use `extraConfiguration` by default so you only maintain a small set of overrides.
- The `configuration` option is an advanced override: if the file format or defaults change, the component may fail to start until you update your full configuration.
- Forgetting to wrap multiline values with (`|`) in Helm can cause parse errors.
- Mixing `env` and `configuration` for the same property without realizing precedence can lead to unexpected results.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs
