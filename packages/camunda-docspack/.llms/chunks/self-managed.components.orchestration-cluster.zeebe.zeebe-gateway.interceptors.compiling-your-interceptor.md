# Interceptors — Compiling your interceptor

Our source code for the interceptor class can now be compiled. There are many
ways to do this, but for simplicity we'll use `javac` directly.

When compiling your class, you need to make sure all compile-time dependencies
are provided. In the example above, that means we need the `grpc-api` and
`slf4j-api` libraries available when compiling.

Since the interceptor will be running inside the Zeebe Gateway, the language
level of the compiled code must be the same as Zeebe's (i.e. currently JDK 21) or lower. This example thus assumes you're using version 21 of `javac`.

```sh
# to compile LoggingInterceptor.java, we'll need to provide the api libraries
javac -classpath .:lib/grpc-api.jar:lib/slf4j-api.jar ./LoggingInterceptor.java
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/interceptors
