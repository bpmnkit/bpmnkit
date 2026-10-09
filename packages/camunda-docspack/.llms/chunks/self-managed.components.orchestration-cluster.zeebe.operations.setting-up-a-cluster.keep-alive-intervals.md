# Setting up a Zeebe cluster — Keep alive intervals

It's possible to specify how often Zeebe clients should send keep alive pings. By default, the [official Zeebe clients](https://docs.camunda.io/docs/next/apis-tools/working-with-apis-tools#official-zeebe-clients) send keep alive pings every 45 seconds. This interval can be configured through the clients' APIs and through the `ZEEBE_KEEP_ALIVE` environment variable. When configuring the clients with the environment variable, the time interval must be expressed a positive amount of milliseconds (e.g., 45000).

It's also possible to specify the minimum interval allowed by the gateway before it terminates the connection. By default, gateways terminate connections if they receive more than two pings with an interval less than 30 seconds. This minimum interval can be modified by editing the network section in the respective configuration file or by setting the `ZEEBE_GATEWAY_NETWORK_MINKEEPALIVEINTERVAL` environment variable.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/setting-up-a-cluster
