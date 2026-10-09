# Gateway configuration — Configuration — zeebe.gateway.cluster.messageCompression

To configure the compression algorithm for all messages sent between the gateway and
the brokers, the following property can be set. Available options are NONE, GZIP, and SNAPPY.
This feature is useful when the network latency between the nodes is very high (for example, when nodes are deployed in different data centers).

When latency is high, the network bandwidth is severely reduced. Therefore, enabling compression helps improve the throughput. You need to decide between reducing bandwidth or reducing resources required for compression.

**Caution**
When this flag is enabled, you must also enable compression in the standalone broker configuration. When there is no latency enabling, this may have a performance impact.

| Field              | Description                                                                                                                                                                                                                                             | Example value |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| messageCompression | Configure compression algorithm for all messages sent between the gateway and the brokers. Available options are NONE, GZIP, and SNAPPY. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_MESSAGECOMPRESSION`. | NONE          |

#### YAML snippet

```yaml
messageCompression: NONE
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway
