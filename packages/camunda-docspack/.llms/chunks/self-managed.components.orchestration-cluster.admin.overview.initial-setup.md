# Admin in Self-Managed — Initial setup

Using the default setup for [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run) will result in a cluster with:

1. Web components login enabled
2. API authentication disabled
3. Authorizations disabled
4. An initial user with username/password: `demo` / `demo`
5. An `admin` role with full permissions, applied to the `demo` user

To modify the [initial configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties), define your custom values in `application.yaml`, and pass this file at startup using the `--config` flag. See [this section](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/configuration#enable-authentication-and-authorization) for details.

**Note**

- In Helm installations, API authentication and authorization are enabled by default. You can adjust these settings in `application.yaml` or using environment variables.
- As a Spring Boot application, the Orchestration Cluster supports standard
  [Spring configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html) methods. [Review configurations which apply to all components within the Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview
