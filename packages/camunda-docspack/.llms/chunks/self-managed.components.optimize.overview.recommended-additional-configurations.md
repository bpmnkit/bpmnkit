# Optimize on Self-Managed — Recommended additional configurations

### Adjust Optimize heap size

By default, Optimize is configured with 1GB JVM heap memory. Depending on your setup and actual data, you might still encounter situations where you need more than this default for a seamless operation of Optimize. To increase the maximum heap size, you can set the environment variable `OPTIMIZE_JAVA_OPTS` and provide the desired JVM system properties; for example, for 2GB of Heap:

```bash
OPTIMIZE_JAVA_OPTS=-Xmx2048m
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/overview
