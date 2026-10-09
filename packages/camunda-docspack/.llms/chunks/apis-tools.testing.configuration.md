# Configuration

See how to configure Camunda Process Test

By default, CPT uses a runtime based on [Testcontainers](#testcontainers-runtime). You can customize the runtime to your
needs, or replace it with a [Remote runtime](#remote-runtime), for example, if you can't install a Docker runtime.


## Configuration files

CPT properties can be set directly in a configuration file or resolved from environment variables. The file location and resolution mechanism depend on your setup:

Configure CPT in your `application.yml` (or `application.properties`). Properties also support [Spring's external configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html), so you can set them through environment variables, system properties, or additional profiles.

Configure CPT in a `camunda-container-runtime.properties` file. Properties support automatic environment variable resolution. If a property is not explicitly set, it is resolved from an environment variable by prepending `CAMUNDA_PROCESSTEST_`, replacing dots with underscores, removing hyphens, and converting to uppercase.

For example, `judge.chatModel.apiKey` resolves to `CAMUNDA_PROCESSTEST_JUDGE_CHATMODEL_APIKEY`.

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
