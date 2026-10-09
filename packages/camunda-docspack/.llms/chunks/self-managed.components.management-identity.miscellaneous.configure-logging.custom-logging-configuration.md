# Configure logging — Custom logging configuration

You can provide your own logging configuration by mounting a configuration file to the Identity container and setting the path to the file using the following variable:

| Environment variable | Purpose                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `LOGGING_CONFIG`     | The path to your [Log4j2 config XML](https://logging.apache.org/log4j/2.x/manual/configuration.html#XML) file |

**Note**
To write logs to a file in a containerized environment, the mounted directory containing the log file has to be writable under the user running Identity.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configure-logging
