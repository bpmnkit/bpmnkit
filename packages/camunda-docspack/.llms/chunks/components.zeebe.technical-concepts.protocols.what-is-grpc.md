# Protocols — What is gRPC?

gRPC was first developed by Google and is now an open source project and part of the Cloud Native Computing Foundation.

If you’re new to gRPC, see [What is gRPC](https://grpc.io/docs/guides/index.html) on the project website for an introduction.


## Why gRPC?

gRPC has many beneficial features that make it a good fit for Zeebe, including:

- Supports bi-directional streaming for opening a persistent connection and sending or receiving a stream of messages between client and server
- Uses the common HTTP/2 protocol by default
- Uses Protocol Buffers as an interface definition and data serialization mechanism–specifically, Zeebe uses proto3, which supports client generation in ten different programming languages.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/protocols
