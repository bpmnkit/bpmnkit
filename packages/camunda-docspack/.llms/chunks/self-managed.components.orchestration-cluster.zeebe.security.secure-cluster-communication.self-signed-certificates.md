# Secure cluster communication — Self signed certificates

If you wish to use self-signed certificates for testing or development purposes, the simplest way is to have all nodes share the same certificate. As aforementioned, the certificate chain configured on a node is also part of its trust store. As such, if all nodes share the same certificate, they will have no trouble verifying the identity of the other nodes.

You can still configure a different self-signed certificate for each node, _provided they can be verified by the other nodes' certificate chain_.

For example, let's say you have your own root certificate authority you use to sign your own certificates, and one certificate for each node that you signed with that authority. For each node, you can then create a certificate chain file which would consist of the node's public certificate, followed by the root certificate authority's public certificate. Though each node would have a different leaf certificate it uses to identify itself, the other nodes could verify its identity since their certificate chain contains an authority used to sign it.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/secure-cluster-communication
