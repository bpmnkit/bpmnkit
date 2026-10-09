# Interceptors — Loading an interceptor into a gateway

An interceptor can be loaded into your gateway as a fat JAR. For each
interceptor, you need to provide your gateway with:

- An interception order index
- An identifier to identify this specific interceptor
- Where to find the JAR with the interceptor class
- The [fully qualified name](https://docs.oracle.com/javase/specs/jls/se17/html/jls-6.html#jls-6.7)
  of the interceptor class, e.g. `com.acme.ExampleInterceptor`

Let's continue with the LoggingInterceptor example. We can provide these
[configurations](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/configuration)
using a gateway config file, environment variables or a mix of both. We'll be
using a config file here.

The following gateway config file configures our LoggingInterceptor so it can be
loaded into the gateway at start-up.

```yaml
zeebe:
  gateway:
    ...

    # allows specifying multiple interceptors
    interceptors:

      - # identifier, can be used for debugging
        id: logging-interceptor

        # name of our ServerInterceptor implementation
        # this must be the fully qualified name of the class
        className: io.camunda.zeebe.example.LoggingInterceptor

        # path to the fat JAR, can be absolute or relative
        jarPath: /tmp/LoggingInterceptor.jar

      # you can add additional interceptors by listing them
      - id: ...
        className: ...
        jarPath: ...
```

Note that multiple interceptors can be configured (i.e.
`zeebe.gateway.interceptors` expects a list of interceptor configurations). The
listing order determines the order in which a call is intercepted by the
different interceptors. The first interceptor in the list wraps the second, etc.
The first interceptor is thus the outermost interceptor. In other words, calls
are intercepted first by the first listed interceptor, followed by the second
listed interceptor, etc.

This configuration can also be provided using environment variables. You'll need
to provide an index for the interceptor in the variable name, to distinguish the
ordering of the different interceptors. For example, to configure the
`className` of the first interceptor use:
`zeebe_gateway_interceptors_0_className`. Likewise, a second interceptor's
`jarPath` can be configured using `zeebe_gateway_interceptors_1_jarPath`.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/interceptors
