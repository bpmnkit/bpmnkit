# Filters — Loading a filter into a gateway

A filter can be loaded into your gateway as a fat JAR. For each
filter, provide the gateway with:

- A filter order index
- An identifier to identify this specific filter
- Where to find the JAR with the filter class
- The [fully qualified name](https://docs.oracle.com/javase/specs/jls/se17/html/jls-6.html#jls-6.7) of the filter class. For example, `com.acme.ExampleFilter`.

Continuing with the `LoggingFilter` example, provide these
[configurations](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/configuration)
using a gateway config file, environment variables, or a mix of both. We'll be
using a config file in this example.

The following gateway config file configures our `LoggingFilter` so it can be
loaded into the gateway at start-up:

```yaml
zeebe:
  gateway:
    ...

    # allows specifying multiple filters
    filters:

      - # identifier, can be used for debugging
        id: logging-filter

        # name of our Filter implementation
        # this must be the fully qualified name of the class
        className: io.camunda.zeebe.example.LoggingFilter

        # path to the fat JAR, can be absolute or relative
        jarPath: /tmp/LoggingFilter.jar

      # you can add additional filters by listing them
      - id: ...
        className: ...
        jarPath: ...
```

**Note**
Multiple filters can be configured (for example,
`zeebe.gateway.filters` expects a list of filter configurations). The
listing order determines the order in which a call is filtered by the
different filters. The first filter in the list wraps the second, etc.
The first filter is thus the outermost filter. In other words, calls
are filtered first by the first listed filter, followed by the second
listed filter, etc.

This configuration can also be provided using environment variables. Provide an index for the filter in the variable name to distinguish the
ordering of the different filters. For example, to configure the
`className` of the first filter use `zeebe_gateway_filters_0_className`. Likewise, a second filter's
`jarPath` can be configured using `zeebe_gateway_filters_1_jarPath`.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/filters
