# Configure logging

Learn how to configure logging in Identity.

Configure and use logging to access detailed operational information for Identity .


## Identity logging configuration

The Identity component uses the [Apache Log4j2](https://logging.apache.org/log4j/2.x/) framework to control the log level and log format.

The logging configuration included in the Identity image is as follows:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN" monitorInterval="30">
    <Properties>
        <Property name="LOG_PATTERN">%clr{%d{yyyy-MM-dd HH:mm:ss.SSS}}{faint} %clr{%5p} %clr{${sys:PID}}{magenta}
            %clr{---}{faint} %clr{[%15.15t]}{faint} %clr{%-40.40c{1.}}{cyan} %clr{:}{faint} %m%n%xwEx
        </Property>
        <Property name="LOG_FILE_PATTERN">%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{1.} %enc{%msg}%n
        </Property>
        <Property name="LOG_FILE_NAME_PATTERN">logs/identity.%d{yyyy-MM-dd-mm-ss}.log</Property>
    </Properties>
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT" follow="true">
            <PatternLayout pattern="${env:IDENTITY_LOG_PATTERN:-${LOG_PATTERN}}"/>
        </Console>
        <Console name="Stackdriver" target="SYSTEM_OUT" follow="true">
            <JsonTemplateLayout eventTemplateUri="classpath:GcpLayout.json" locationInfoEnabled="true"/>
        </Console>
        <RollingFile
                name="File"
                fileName="${env:IDENTITY_LOG_FILE_NAME:-logs/identity.log}"
                filePattern="${env:IDENTITY_LOG_FILE_NAME_PATTERN:-${LOG_FILE_NAME_PATTERN}}"
                append="true">
            <PatternLayout pattern="${env:IDENTITY_LOG_FILE_PATTERN:-${LOG_FILE_PATTERN}}"/>
            <Policies>
                <TimeBasedTriggeringPolicy interval="${env:IDENTITY_LOG_FILE_ROTATION_DAYS:-1}"/>
                <SizeBasedTriggeringPolicy size="${env:IDENTITY_LOG_FILE_ROTATION_SIZE:-50 MB}"/>
            </Policies>
        </RollingFile>
    </Appenders>
    <Loggers>
        <Logger name="io.camunda.identity" level="${env:IDENTITY_LOG_LEVEL:-info}"/>
        <Root level="warn">
            <AppenderRef ref="${env:IDENTITY_LOG_APPENDER:-Console}"/>
        </Root>
    </Loggers>
</Configuration>
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configure-logging
