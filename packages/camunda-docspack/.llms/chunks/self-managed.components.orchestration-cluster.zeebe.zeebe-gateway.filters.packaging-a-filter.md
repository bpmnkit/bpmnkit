# Filters — Packaging a filter

Next, package the filter class into a fat JAR. Such a JAR must
contain all classes (for example, all classes your own classes depend upon at
runtime).

Like compiling, there are many ways to do this, but we'll use
`jar` directly. This means we must define a Java manifest file by hand to place the libraries' classes on the classpath.

Similar to your filter class, any libraries you package must be compiled
for the same language level as Zeebe's (currently JDK 21) or lower.

**Note**

The file path for `jar` should match the package name. For example, if your package name is `com.example`, you should package `jar` as `jar cvfm LoggingFilter.jar ./MANIFEST.MF ./com/example/*.class ./lib`.

```sh
# both runtime libraries and the manifest must be packaged together with the compiled classes
jar cvfm LoggingFilter.jar ./MANIFEST.MF ./*.class ./lib

# let's verify the contents of the JAR
jar tf ./LoggingFilter.jar
# META-INF/
# META-INF/MANIFEST.MF
# LoggingFilter.java
# LoggingFilter$1.class
# lib/
# lib/jakarta.servlet-api.jar
# lib/slf4j-api.jar
# lib/slf4j.jar
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/filters
