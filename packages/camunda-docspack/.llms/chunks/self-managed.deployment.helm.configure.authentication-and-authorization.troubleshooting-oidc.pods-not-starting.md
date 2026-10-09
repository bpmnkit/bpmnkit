# Troubleshoot OIDC authentication — Pods not starting

**Observed behavior:** Pods remain in `Pending`, `CrashLoopBackOff`, or `Error` states.

**Why this happens:** Required secrets are missing, PostgreSQL is still initializing, or there are configuration typos in OIDC URLs.

**How to fix:**

1. Inspect pod events and status with `kubectl describe pod <pod-name> -n camunda` and `kubectl logs <pod-name> -n camunda`.
2. Check component logs with `kubectl logs -n camunda deployment/<component-name> -f` and search for keywords: `auth`, `token`, `oidc`, `401`, `403`.


## Request header is too large

**Observed behavior:** Logging in to Management Identity fails and the browser shows a Tomcat error page, for example `HTTP Status 400 – Bad Request`.

Management Identity logs contain messages similar to:

```text
o.a.coyote.http11.Http11Processor : Error parsing HTTP request header
Note: further occurrences of HTTP request parsing errors will be logged at DEBUG level.

java.lang.IllegalArgumentException: Request header is too large
    at org.apache.coyote.http11.Http11InputBuffer.fill(Http11InputBuffer.java:765)
    ...
```

**Why this happens:** When using an external OIDC provider (for example, Microsoft Entra ID), the access token and related cookies (such as `IDENTITY_JWT`, `IDENTITY_REFRESH_JWT`, and Optimize cookies) can make the HTTP request header larger than the default limit of the embedded application server (Tomcat).

By default, Tomcat rejects requests whose headers exceed this limit (typically 8 KB). As a result, the request never reaches Camunda, and the login fails with request header is too large.

**How to fix:**

Increase the maximum allowed HTTP request header size for the Identity service.

1. Configure the Spring Boot property `server.max-http-request-header-size` (via the `SERVER_MAX_HTTP_REQUEST_HEADER_SIZE` environment variable) to a value higher than the default, for example 40KB.

2. If you are using the Helm chart, set this environment variable on the Identity deployment in your `values.yaml`, similar to other Identity environment variables:

   ```yaml
   identity:
     env:
       - name: SERVER_MAX_HTTP_REQUEST_HEADER_SIZE
         value: "40KB"
   ```

3. Upgrade or redeploy the release so the new environment variable takes effect.

The Orchestration Cluster can hit the same limit when its session cookies and authorization code grow large enough, for example with Microsoft Entra. If Operate or Tasklist login fails with the same symptom, set `SERVER_MAX_HTTP_REQUEST_HEADER_SIZE` under `orchestration.env` instead.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/troubleshooting-oidc
