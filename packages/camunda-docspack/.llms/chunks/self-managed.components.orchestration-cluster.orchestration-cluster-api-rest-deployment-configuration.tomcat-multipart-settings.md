# Deployment configuration — Tomcat multipart settings

Tomcat, which underlies many Java web applications, also applies multipart limits. If you're uploading multiple files as part of a multipart request, note that Tomcat limits the number of parts per request using the `server.tomcat.max-part-count` property. By default, this is set to 50 in the orchestration API. You can increase the limit to allow more files by setting the property in your configuration:

```properties
server.tomcat.max-part-count=100
```

or using an environment variable:

```properties
SERVER_TOMCAT_MAX_PART_COUNT=100
```

The default is `50` in the orchestration API layer.

#### Max parameter count

Tomcat also enforces a separate limit on the total number of request parameters via the `server.tomcat.max-parameter-count` property. Since each file upload typically counts as both a part and a parameter, the lower of these two limits will determine how many files can be uploaded.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/orchestration-cluster-api-rest-deployment-configuration
