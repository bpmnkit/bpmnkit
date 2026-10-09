# Camunda components troubleshooting — Zeebe backup with Azure Blob Storage

When using an Azure backup store, requests to the backup API may time out due to [a bug in the Azure SDK](https://github.com/Azure/azure-sdk-for-java/issues/46231).

This issue is caused by a deadlock in the Azure SDK when virtual threads are used. It is more likely to occur on systems with many partitions per broker and limited CPU resources.

To mitigate this, set the following environment variable on your Zeebe brokers to disable virtual threads in the Azure SDK:

```
AZURE_SDK_SHARED_THREADPOOL_USEVIRTUALTHREADS=false
```


## Zeebe fails with `ClassCircularityError` when using AppDynamics

Zeebe brokers and gateways can fail with a `java.lang.ClassCircularityError` when the AppDynamics Java agent is attached to the JVM.

### Symptoms

One of the following errors appears in the logs:

```text
java.lang.ClassCircularityError: jdk/internal/misc/VirtualThreads
```

```text
java.lang.IllegalStateException: java.lang.ClassCircularityError: jdk/internal/misc/VirtualThreads
```

The error can occur in any code path that runs on virtual threads, for example during S3 backups or while the gateway handles gRPC requests. After the error, the JVM may be left in a broken state:

- A broker tries to shut down, but the shutdown doesn't complete and the JVM process keeps running. Partitions led by that broker stay unavailable.
- A gateway stops responding to gRPC requests, while health checks such as `/actuator/health/liveness` still report it as healthy.

Because health checks don't always detect the broken state, Kubernetes might not restart the affected pod automatically.

### Cause

Zeebe and several libraries it depends on, such as the AWS SDK and gRPC, run work on Java virtual threads. The AppDynamics Java agent intercepts class definitions to instrument bytecode. On a virtual thread, the agent's own code triggers loading of `jdk/internal/misc/VirtualThreads`, which the agent intercepts again. The JVM detects this circular class loading and throws `ClassCircularityError`, and the JVM can't reliably recover from it.

This is a defect in the AppDynamics Java agent. Zeebe doesn't provide an option to disable virtual threads, because third-party libraries also use them internally.

### Solution

- Don't attach the AppDynamics Java agent to Zeebe brokers or gateways. Remove the AppDynamics `-javaagent` option from the JVM options, for example from the `JAVA_TOOL_OPTIONS` environment variable.
- If you need AppDynamics for a specific investigation, attach the agent temporarily and remove it afterward. Bytecode instrumentation also adds overhead that can affect performance.
- If the error occurs, restart the affected pod or JVM process. Don't wait for the process to exit or for health checks to fail, as neither is guaranteed.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting
