# Monitor cluster load — Manage cluster load

Cluster load will fluctuate based on incoming user requests and internal processing load:

- User requests are those sent directly by an external client.
- Internal load refers to all other processing that is **not** directly triggered by a client. For example, timer events, a job being made available after back off, and so on.

This means that cluster load could fluctuate throughout the day. For example:

- Cluster load might be higher during business hours, but lower overnight when the cluster is unused.
- Certain processes can cause a "fan-out" effect, where even though creating a process instance is only a single user request, it could require computation on a very large multi-instance collection, resulting in a high cluster load spike.
- You could have a spike in cluster load if a large number of timers are triggered at the same time.

### High cluster load percentage

A high cluster load percentage and utilization does not necessarily mean that a cluster needs to be resized, but it could indicate that your cluster is overloaded.

> A high cluster load percentage benchmark is relative, but generally **anything above 60%** is considered high.

If your cluster load and utilization is too high, but your operations are completing within an acceptable timeframe, requests are successful, and so on, you do not need to take any action.

However, if you find yourself experiencing any of the following issues, you might need to investigate and take action:

- REST clients are receiving a high number of `429` errors.
- gRPC clients are receiving a high number of `RESOURCE_EXHAUSTED` errors.
- More and more commands or queries are timing out in your clients.
- Web components are slowing down, or showing data that is severely out of date (for example, 1 hour).

In this scenario, you should look at reducing the overall load on the cluster.

### Reduce cluster load

If your cluster load and utilization is too high, you can help reduce it by:

- Scaling down the load. For example, by stopping certain clients. Start with your least critical load, and continue from there.
- Check your running process instances for known issues that cause high processing, such as:
  - Straight-through processing loops, where there are no wait states. For example, a sub process with an error boundary event which loops back to an activity leading into the sub-process. If you have an activity which consistently throws an error, this will result in a subtle infinite loop where the engine is stuck and cannot process anything else. You would have to cancel this instance, or contact support to force cancel it for you.

**Important**
If your cluster load percentage remains high even after attempts to reduce it, you might need to increase your cluster size and scale. See [cluster size](https://docs.camunda.io/docs/next/components/concepts/clusters#cluster-size) and [sizing your environment](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/cluster-capacity
