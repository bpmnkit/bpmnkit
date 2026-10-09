# Zeebe Gateway — Why do we have the Zeebe Gateway and what problems does it solve?

The Zeebe Gateway protects the brokers from external sources. In standalone mode, it allows the creation of a demilitarized zone ([DMZ](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/zeebe-gateway-overview/<https:/en.wikipedia.org/wiki/DMZ_(computing)>)) in which the Zeebe Gateway is the only contact point. With an embedded gateway, the Orchestration Cluster nodes are the contact point, and the DMZ boundary is usually a load balancer or reverse proxy in front of them.

The Zeebe Gateway also allows you to easily create clients in your language of choice while keeping the client implementation as thin as possible. The clients can be kept thin, since the gateway takes care of the cluster topology and forwards the requests to the right partitions. There are already several client implementations available, officially-supported, and community-maintained. Check the list [here](https://docs.camunda.io/docs/next/apis-tools/working-with-apis-tools).

In standalone mode, the gateway can be run and scaled independently of the brokers, which means it translates the messages, distributes them to the correct partition leaders, and separates the concerns of the applications. For example, if your system encounters a spike of incoming requests, and you have set up enough partitions on the broker side up front, but not enough gateways to handle the load, you can easily scale them up.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/zeebe-gateway-overview
