# Deployment configuration — REST API server configuration

If you're increasing the `maxMessageSize` and using the REST API for multipart uploads (for example, using `POST /v2/deployments`), you must configure your application to accept the updated request sizes. If you increase the `maxMessageSize` to 10MB, increase these property values to 10MB as well.

For Spring Boot applications:

```properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
server.tomcat.max-http-form-post-size=10MB
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/orchestration-cluster-api-rest-deployment-configuration
