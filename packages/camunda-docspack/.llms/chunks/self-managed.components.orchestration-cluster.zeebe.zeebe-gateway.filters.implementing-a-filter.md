# Filters — Implementing a filter

To communicate between client and gateway, Zeebe uses [REST](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/components/zeebe/technical-concepts/protocols).

A filter is then implemented as a Jakarta servlet [filter](https://www.javadoc.io/doc/jakarta.servlet/jakarta.servlet-api/6.0.0/jakarta.servlet/jakarta/servlet/Filter.html).

An implementation must adhere to the following requirements:

- It implements a [filter](https://www.javadoc.io/doc/jakarta.servlet/jakarta.servlet-api/6.0.0/jakarta.servlet/jakarta/servlet/Filter.html)
- It has public visibility
- It has a public default constructor (for example, no-arg constructor)

Consider a filter logging incoming calls as an example:

```java
package io.camunda.zeebe.example;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * A simple filter that logs each incoming call. The class must be public
 * since we will load it via JAR into the gateway.
 */
public final class LoggingFilter implements Filter {
  private static final Logger LOGGER =
          LoggerFactory.getLogger("LoggingFilter");

  @Override
  public void doFilter(
          final ServletRequest servletRequest,
          final ServletResponse servletResponse,
          final FilterChain filterChain)
          throws IOException, ServletException {
    LOGGER.trace("filtered a call");
    filterChain.doFilter(servletRequest, servletResponse);
  }
}
```

This example filter will log `filtered a call` at `TRACE` level for
each incoming call it filters. This specific filter always dispatches
all incoming calls to the target broker, but it is possible to stop
the message from being filtered by other filters, and even block it from
dispatching to the broker.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/filters
