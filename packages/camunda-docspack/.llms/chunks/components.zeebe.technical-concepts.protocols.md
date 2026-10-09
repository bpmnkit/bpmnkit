# Protocols

Let's discuss gRPC and supported clients.

Zeebe clients connect to brokers via a stateless gateway.

For the communication between client and gateway, a mix of REST and [gRPC](https://grpc.io/) is used. The gRPC protocol is defined using Protocol Buffers v3 ([proto3](https://developers.google.com/protocol-buffers/docs/proto3)), and you can find it in the
[Zeebe repository](https://github.com/camunda/camunda/tree/main/zeebe/gateway-protocol). There, you will also find the OpenAPI v3 spec for the REST portion of the gateway API.

Note that while gRPC requires HTTP/2, the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) can work with either HTTP/1.1 or HTTP/2.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/protocols
