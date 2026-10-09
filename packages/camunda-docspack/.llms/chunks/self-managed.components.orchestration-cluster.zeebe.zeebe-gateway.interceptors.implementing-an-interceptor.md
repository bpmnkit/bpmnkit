# Interceptors — Implementing an interceptor

For the communication between client and gateway, Zeebe uses the gRPC
[protocol](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/components/zeebe/technical-concepts/protocols). An interceptor is
thus implemented as a gRPC
[ServerInterceptor](https://grpc.github.io/grpc-java/javadoc/io/grpc/ServerInterceptor.html).

An implementation must adhere to the following requirements:

- It implements [ServerInterceptor](https://grpc.github.io/grpc-java/javadoc/io/grpc/ServerInterceptor.html)
- It has public visibility
- It has a public default constructor (i.e. no-arg constructor)

Let's consider an interceptor that provides logging of incoming calls as an
example. Other ServerInterceptor examples can be found in the official grpc-java
[examples](https://github.com/grpc/grpc-java/tree/v1.41.0/examples).

```java
package io.camunda.zeebe.example;

import io.grpc.ForwardingServerCallListener.SimpleForwardingServerCallListener;
import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCall.Listener;
import io.grpc.ServerCallHandler;
import io.grpc.ServerInterceptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A simple interceptor that logs each incoming call. The class must be public
 * since we will load it via JAR into the gateway.
 */
public final class LoggingInterceptor implements ServerInterceptor {
  private static final Logger LOGGER =
      LoggerFactory.getLogger("LoggingInterceptor");

  @Override
  public <ReqT, RespT> Listener<ReqT> interceptCall(
      final ServerCall<ReqT, RespT> call,
      final Metadata headers,
      final ServerCallHandler<ReqT, RespT> next) {
    final var listener = next.startCall(call, headers);
    return new SimpleForwardingServerCallListener<>(listener) {
      @Override
      public void onMessage(final ReqT message) {
        LOGGER.trace("intercepted a call");
        super.onMessage(message);
      }
    };
  }
}
```

This example interceptor will log `"intercepted a call"` at `TRACE` level for
each incoming call it intercepted. This specific interceptor always dispatches
all incoming calls to the target broker, but it would also be possible to stop
the message from interception by other interceptors and even to block it from
dispatch to the broker.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/interceptors
