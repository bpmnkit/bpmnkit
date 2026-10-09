# Configuration — Passing configuration files to Zeebe

Rename the configuration file to `application.yaml` and place it in the following location:

```shell script
./config/application.yaml
```

### Other ways to specify the configuration file

Zeebe uses Spring Boot for its configuration parsing. All other ways to [configure a Spring Boot application](https://docs.spring.io/spring-boot/reference/features/external-config.html) should also work. In particular, you can use:

- `SPRING_CONFIG_ADDITIONAL_LOCATION` to specify an additional configuration file.
- `SPRING_APPLICATION_JSON` to specify settings in JSON format.

Details can be found in the Spring documentation.

**Note**
We recommend not to use `SPRING_CONFIG_LOCATION` as this will replace all existing configuration defaults. When used inappropriately, some features will be disabled or will not be configured properly.

If you specify `SPRING_CONFIG_LOCATION`, specify it like this:

```shell script
export SPRING_CONFIG_LOCATION='classpath:/,file:./[path to config file]'
```

This will ensure the defaults defined in the classpath resources will be used (unless explicitly overwritten by the configuration file you provide). If you omit the defaults defined in the classpath, some features may be disabled or will not be configured properly.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/configuration
