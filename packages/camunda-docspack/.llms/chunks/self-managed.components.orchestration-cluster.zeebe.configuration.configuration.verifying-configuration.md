# Configuration — Verifying configuration

Start Zeebe to verify the configuration was applied. If the configuration could be read, Zeebe will expose it via the monitoring port at [http://localhost:9600/actuator/configprops/zeebe](http://localhost:9600/actuator/configprops/zeebe). This will show you both the resolved configuration and its inputs.

**Note**

Zeebe uses the Spring Boot [configprops](https://docs.spring.io/spring-boot/docs/current/actuator-api/htmlsingle/#configprops) actuator for this, so any documentation listed there applies as well.

In some cases of invalid configuration, Zeebe will fail to start and log a warning that explains which configuration setting could not be read.

```
17:17:38.796 [] [main] ERROR org.springframework.boot.diagnostics.LoggingFailureAnalysisReporter -

***************************
APPLICATION FAILED TO START
***************************

Description:

Failed to bind properties under 'zeebe.broker.network.port-offset' to int:

    Property: zeebe.broker.network.port-offset
    Value: false
    Origin: System Environment Property "ZEEBE_BROKER_NETWORK_PORTOFFSET"
    Reason: failed to convert java.lang.String to int

Action:

Update your application's configuration
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/configuration
