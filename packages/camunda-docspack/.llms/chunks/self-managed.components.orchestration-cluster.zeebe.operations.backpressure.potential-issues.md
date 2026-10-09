# Backpressure — Potential issues

The rate limiter used by Zeebe to implement backpressure may use `System.nanoTime()` to measure the RTT of requests. In some systems, we've observed consecutive calls to this method can return equal or even decreasing values. [Low clock resolution](https://shipilev.net/blog/2014/nanotrusting-nanotime) and [monotonicity](https://bugs.openjdk.java.net/browse/JDK-6458294) [issues](https://stackoverflow.com/questions/3657289/linux-clock-gettimeclock-monotonic-strange-non-monotonic-behavior) are some of the most likely culprits of this. If this happens, it's recommended to configure the backpressure to use the **fixed** algorithm. Without a clock with sufficient resolution, adaptive backpressure algorithms are not useful.

---
---

**Note**
We recommend reducing the rate of requests. When backpressure is active, the broker may reject any request except _CompleteJob_ RPC and _FailJob_ RPC. These requests are allowed during backpressure and are always accepted by the broker even if it is receiving requests above its limits.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/backpressure
