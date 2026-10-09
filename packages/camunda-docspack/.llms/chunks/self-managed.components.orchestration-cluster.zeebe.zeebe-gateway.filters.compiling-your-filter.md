# Filters — Compiling your filter

Our source code for the filter class can now be compiled. There are many
ways to do this, but for simplicity we'll use `javac` directly.

When compiling your class, ensure all compile-time dependencies
are provided. In the example above, you'll need the `jakarta.servlet-api` and
`slf4j-api` libraries available when compiling.

Since the filter will be running inside the Zeebe Gateway, the language
level of the compiled code must be the same as Zeebe's (i.e. currently JDK 21) or lower. This example thus assumes you're using version 21 of `javac`.

```sh
# to compile LoggingFilter.java, we'll need to provide the api libraries
javac -classpath .:lib/jakarta.servlet-api.jar:lib/slf4j-api.jar ./LoggingFilter.java
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/filters
