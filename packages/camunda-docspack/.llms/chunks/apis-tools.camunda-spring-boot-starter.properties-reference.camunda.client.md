# Properties reference — `camunda.client`

Properties for the Camunda client.

  
    Property
    Description
    Default value
  

  

The path to a root Certificate Authority (CA) certificate to use instead of the certificate in the default store.

Type: string

  null

  

Enable or disable the Camunda client. If disabled, the client bean is not created.

Type: boolean

  true

  

The number of threads for invocation of job workers.

Type: integer

  1

  

The gRPC address of Camunda that the client can connect to. The address must be an absolute URL, including the scheme. An alternative default is set by both `camunda.client.mode`.

Type: url

  &quot;http:&#x2F;&#x2F;0.0.0.0:26500&quot;

  

The time interval between keep-alive messages sent to the gateway.

Type: duration

  &quot;PT45S&quot;

  

The maximum number of concurrent HTTP connections the client can open.

Type: integer

  100

  

A custom `maxMessageSize` sets the maximum inbound message size the client can receive from Camunda. It specifies the `maxInboundMessageSize` of the gRPC channel.

Type: dataSize

  &quot;5MB&quot;

  

A custom `maxMetadataSize` sets the maximum inbound metadata size the client can receive from Camunda. It specifies the `maxInboundMetadataSize` of the gRPC channel.

Type: dataSize

  &quot;16KB&quot;

  

The default time-to-live for a message when no value is provided.

Type: duration

  &quot;PT1H&quot;

  

The client mode to use. If not set, `saas` mode is detected based on the presence of a `camunda.client.cloud.cluster-id`.

Type: enum[self-managed, saas]

  null

  

Overrides the authority used with TLS virtual hosting to change hostname verification during the TLS handshake. It does not change the actual host connected to.

Type: string

  null

  

The physical tenant ID sent as the `camunda-physical-tenant` gRPC header on every outgoing call. When `null` the header is omitted.

Type: string

  null

  

If `true`, prefers REST over gRPC for operations supported by both protocols.

Type: boolean

  true

  

If true, prefixes the REST base path with the physical tenant path when a physical tenant ID is set. Set to false to use the configured REST address as is, for example behind a reverse proxy that already routes to the physical tenant.

Type: boolean

  true

  

The request timeout to use when not overridden by a specific command.

Type: duration

  &quot;PT10S&quot;

  

The request timeout client offset applies to commands that also pass the request timeout to the server. It ensures the client timeout occurs after the server timeout. For these commands, the client-side timeout equals the request timeout plus the offset.

Type: duration

  &quot;PT1S&quot;

  

The REST API address of the Camunda instance that the client can connect to. The address must be an absolute URL, including the scheme. An alternative default is set by both `camunda.client.mode`.

Type: url

  &quot;http:&#x2F;&#x2F;0.0.0.0:8080&quot;

  

The tenant ID used for tenant-aware commands when no tenant ID is set.

Type: string

  &quot;&lt;default&gt;&quot;

  

If `true`, enables client-side load balancing by using DNS-based resolution and distributing requests across all resolved addresses. Useful for setups without an external load balancer, such as Docker Compose, Testcontainers, or Kubernetes headless services.

Type: boolean

  false

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/properties-reference
