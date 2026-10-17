# Conceptual differences — Other process solution architectures

Besides Spring Boot, there are other environments used to build process solutions.

### Container-managed engine (Tomcat, WildFly, WebSphere & co)

Camunda 8 doesn't provide integration into Jakarta EE application servers like Camunda 7 does. Instead, Jakarta EE applications need to manually add the Zeebe client library. The implications are comparable to what is described for Spring Boot applications in this guide.

<!-- TODO mention what is on the left side and the right side of the picture below -->

![A diagram showing a container-managed engine](../img/architecture-container-managed.png)

<!-- TODO the titles of the boxes could be more explicit -->

### CDI or OSGI

Due to limited adoption, there is no support for CDI or OSGI in Camunda 8. A lightweight integration layer comparable to the [Camunda Spring Boot Starter](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started) may be provided in the future.

### Polyglot applications (C#, Node.js)

When you run your application in Node.js or C#, for example, you exchange one remote engine (Camunda 7) with another (Camunda 8). As Zeebe comes with a different API, you need to adjust your source code.

![A diagram showing a polygot application architecture](../img/architecture-polyglot.png)

<!-- TODO the titles of the boxes could be more explicit -->

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/conceptual-differences
