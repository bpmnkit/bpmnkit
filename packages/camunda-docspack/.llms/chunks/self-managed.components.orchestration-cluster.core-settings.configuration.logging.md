# Logging

Configure and manage logging for the Camunda 8 Self-Managed Orchestration Cluster components.

This page explains how to configure and manage logging in the **Camunda 8 Self-Managed Orchestration Cluster**, which includes **Zeebe**, **Operate**, **Tasklist**, and **Admin**. All components use the **Log4j2** framework.

You can configure log levels, output formats, appenders, and adjust logging dynamically at runtime.


## Default Log4j2 configuration

The default `log4j2.xml` (Zeebe, Operate, Tasklist, Admin) representation:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration xmlns="https://logging.apache.org/xml/ns"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="
                   https://logging.apache.org/xml/ns
                   https://logging.apache.org/xml/ns/log4j-config-2.xsd" status="WARN" shutdownHook="disable">
  <Properties>
    <Property name="log.path" value="${sys:app.home}/logs" />
    <Property name="log.pattern" value="[%d{yyyy-MM-dd HH:mm:ss.SSS}] [%t] %notEmpty{[%X] }%-5level%n\t%logger{36} - %msg%n" />
    <Property name="log.stackdriver.serviceName" value="${env:ZEEBE_LOG_STACKDRIVER_SERVICENAME:-${env:OPERATE_LOG_STACKDRIVER_SERVICENAME:-${env:OPTIMIZE_LOG_STACKDRIVER_SERVICENAME:-${env:TASKLIST_LOG_STACKDRIVER_SERVICENAME:-}}}}"/>
    <Property name="log.stackdriver.serviceVersion" value="${env:ZEEBE_LOG_STACKDRIVER_SERVICEVERSION:-${env:OPERATE_LOG_STACKDRIVER_SERVICEVERSION:-${env:OPTIMIZE_LOG_STACKDRIVER_SERVICEVERSION:-${env:TASKLIST_LOG_STACKDRIVER_SERVICEVERSION:-}}}}"/>
  </Properties>

  <Appenders>
    <Console name="Console" target="SYSTEM_OUT">
      <PatternLayout
        pattern="${log.pattern}"/>
    </Console>

    <Console name="Stackdriver" target="SYSTEM_OUT">
      <JsonTemplateLayout charset="UTF-8"
        eventTemplateUri="classpath:logging/StackdriverLayout.json"
        locationInfoEnabled="true"
        stackTraceEnabled="true"/>
    </Console>

    <Select>
      <EnvironmentArbiter propertyName="CAMUNDA_LOG_FILE_APPENDER_ENABLED" propertyValue="false">
        <Null name="RollingFile" />
      </EnvironmentArbiter>
      <DefaultArbiter>
        <RollingFile name="RollingFile" fileName="${log.path}/zeebe.log"
          filePattern="${log.path}/zeebe-%d{yyyy-MM-dd}-%i.log.gz">
          <PatternLayout pattern="${log.pattern}" />
          <Policies>
            <TimeBasedTriggeringPolicy/>
            <SizeBasedTriggeringPolicy size="250 MB"/>
          </Policies>
        </RollingFile>
      </DefaultArbiter>
    </Select>
  </Appenders>

  <Loggers>
    <Logger name="io.camunda" level="${env:CAMUNDA_LOG_LEVEL:-INFO}" />
    <Logger name="io.camunda.zeebe" level="${env:ZEEBE_LOG_LEVEL:-${env:CAMUNDA_LOG_LEVEL:-INFO}}" />
    <Logger name="io.atomix" level="${env:ATOMIX_LOG_LEVEL:-${env:CAMUNDA_LOG_LEVEL:-INFO}}" />
    <Logger name="org.elasticsearch" level="${env:ES_LOG_LEVEL:-WARN}" />
    <Logger name="org.springframework" level="INFO" />

    <Root level="WARN">
      <AppenderRef ref="RollingFile" />

      <!-- remove to disable console logging -->
      <AppenderRef ref="${env:ZEEBE_LOG_APPENDER:-${env:OPERATE_LOG_APPENDER:-${env:OPTIMIZE_LOG_APPENDER:-${env:TASKLIST_LOG_APPENDER:-Console}}}}"/>
    </Root>
  </Loggers>

</Configuration>
```

**Note**
This is a simplified example. The actual `log4j2.xml` may include additional appenders, different file paths, or slightly different patterns.  
See the full [logging documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/logging#default-logging-configuration) for the official default file and additional settings.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/logging
