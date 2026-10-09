# Interceptors — Packaging an interceptor

Next, you need to package the interceptor class into a fat JAR. Such a JAR must
contain all classes (i.e. including all classes your own classes depend upon at
runtime).

Like compiling there are many ways to do this, but for simplicity we'll use
`jar` directly. Note, that means we have to define a java manifest file by hand,
in order to place the libraries' classes on the classpath.

Similar to your interceptor class, any libraries you package must be compiled
for the same language level as Zeebe's (i.e. currently JDK 21) or lower.

**Note**

The file path for `jar` should match the package name. For example, if your package name is `com.example`, you should package `jar` as `jar cvfm LoggingInterceptor.jar ./MANIFEST.MF ./com/example/*.class ./lib`.

```sh
# both runtime libraries and the manifest must be packaged together with the compiled classes
jar cvfm LoggingInterceptor.jar ./MANIFEST.MF ./*.class ./lib

# let's verify the contents of the JAR
jar tf ./LoggingInterceptor.jar
# META-INF/
# META-INF/MANIFEST.MF
# LoggingInterceptor.java
# LoggingInterceptor$1.class
# lib/
# lib/grpc-api.jar
# lib/grpc.jar
# lib/slf4j-api.jar
# lib/slf4j.jar
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/interceptors
