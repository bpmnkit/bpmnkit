# Logging — Default Log4j2 configuration

The default `log4j2-spring.xml` used by Camunda Hub's `restapi` component is as follows:

```xml
<Configuration xmlns="https://logging.apache.org/xml/ns"
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xsi:schemaLocation="
                   https://logging.apache.org/xml/ns
                   https://logging.apache.org/xml/ns/log4j-config-2.xsd" status="WARN" shutdownHook="disable">

  <Properties>
    <Property name="log.path" value="${sys:app.home}/logs" />
    <Property name="log.pattern" value="[%d{yyyy-MM-dd HH:mm:ss.SSS}] [%t] %notEmpty{[%X] }%-5level%n\t%logger{36} - %msg%n" />
  </Properties>

  <Appenders>
    <Console name="Console" target="SYSTEM_OUT" follow="true">
      <PatternLayout pattern="${log.pattern}"/>
    </Console>

    <Console name="Stackdriver" target="SYSTEM_OUT" follow="true">
      <JsonTemplateLayout charset="UTF-8"
          eventTemplateUri="classpath:logging/StackdriverLayout.json"
          locationInfoEnabled="true"
          stackTraceEnabled="true"/>
    </Console>

    <Select>
      <EnvironmentArbiter propertyName="CAMUNDA_LOG_FILE_APPENDER_ENABLED" propertyValue="true">
        <RollingFile name="RollingFile" fileName="${log.path}/camunda-modeler.log"
                     filePattern="${log.path}/camunda-modeler-%d{yyyy-MM-dd}-%i.log.gz">
          <PatternLayout pattern="${log.pattern}" />
          <Policies>
            <TimeBasedTriggeringPolicy/>
            <SizeBasedTriggeringPolicy size="250 MB"/>
          </Policies>
        </RollingFile>
      </EnvironmentArbiter>
      <DefaultArbiter>
        <Null name="RollingFile" />
      </DefaultArbiter>
    </Select>
  </Appenders>

  <Loggers>

    <Logger name="io.camunda" level="${env:CAMUNDA_LOG_LEVEL:-INFO}" />
    <Logger name="io.camunda.modeler" level="${env:CAMUNDA_HUB_LOG_LEVEL:-${env:CAMUNDA_LOG_LEVEL:-INFO}}" />
    <Logger name="org.springframework" level="INFO" />

    <Root level="INFO">
      <AppenderRef ref="RollingFile" />

      <!-- remove to disable console logging -->
      <AppenderRef ref="${env:CAMUNDA_HUB_LOG_APPENDER:-Console}"/>
    </Root>
  </Loggers>
</Configuration>
```

**Note**
This is a simplified example. The actual `log4j2.xml` may include additional appenders, use different file paths, or have slightly different patterns.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/logging
