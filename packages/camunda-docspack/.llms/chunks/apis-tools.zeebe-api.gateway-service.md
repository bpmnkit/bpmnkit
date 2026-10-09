# Zeebe API RPCs

The Zeebe client gRPC API is exposed through a single gateway service.

The Zeebe client gRPC API is exposed through a single gateway service. The current version of the protocol buffer file can be found in the [Zeebe repository](https://github.com/camunda/camunda/blob/main/zeebe/gateway-protocol/src/main/proto/gateway.proto).


## Default service config

Along with the gateway protocol definition, the gateway service also bundles a [default service configuration file](https://github.com/camunda/camunda/blob/main/zeebe/gateway-protocol-impl/src/main/resources/gateway-service-config.json).
This file can be used as is, or as a template to create your own, and defines default retry strategies on a per-RPC basis: when to retry (based on error code), how often, how soon, etc.
This file is also loaded by the [Camunda Java client](https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started) if `useDefaultRetryPolicy` is set to true.

**Note**
Read more about [service configuration files](https://github.com/grpc/grpc/blob/master/doc/service_config.md). These files are especially useful
when using the Camunda protocol in languages without, or with less feature-rich clients and SDKs.

Usage of this file largely depends on the gRPC bindings for your language of choice. For example, when using Java, you would programmatically configure your
client using:

```java
final ObjectMapper objectMapper = new ObjectMapper();
final File configFile = new File("gateway-service-config.json");
final Map<String, Object> serviceConfig = objectMapper.readValue(
      configFile, new TypeReference<Map<String, Object>>() {});
final ManagedChannelBuilder<?> channelBuilder = ManagedChannelBuilder.forAddress("localhost", 26500);

channelBuilder.defaultServiceConfig(serviceConfig);
channelBuilder.enableRetry();
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
