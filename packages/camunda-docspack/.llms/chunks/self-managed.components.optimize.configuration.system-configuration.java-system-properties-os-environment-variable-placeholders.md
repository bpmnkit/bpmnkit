# Overview — Java system properties & OS environment variable placeholders

To externalize configuration properties from the `environment-config.yaml`, Optimize provides variable placeholder support.

The order in which placeholders are resolved is the following:

1. Java system properties
2. OS environment variables

The placeholder format is `${VARIABLE_NAME}` and allows you to refer to a value of a Java system property or OS environment variable of your choice.
The `VARIABLE_NAME` is required to contain only lowercase or uppercase letters, digits and underscore `_` characters and shall not begin with a digit. The corresponding regular expression is `([a-zA-Z_]+[a-zA-Z0-9_]*)`.

The following example illustrates the usage:

```
security:
  auth:
    token:
      secret: ${AUTH_TOKEN_SECRET}
```

Given this variable is set before Optimize is started, for example on Unix systems with:

```
export AUTH_TOKEN_SECRET=sampleTokenValue
```

The value will be resolved at startup to `sampleTokenValue`.

However, if the same variable is provided at the same time as a Java system property, for example via passing `-DAUTH_TOKEN_SECRET=othertokenValue` to the Optimize startup script:

```
./optimize-startup.sh -DAUTH_TOKEN_SECRET=othertokenValue
```

The value would be resolved to `othertokenValue` as Java system properties have precedence over OS environment variables.

**Note**
For Windows users, to pass Java system properties to the provided Windows Batch script `optimize-startup.bat`, you have to put them into double quotes when using the `cmd.exe` shell, as shown below.

```
optimize-startup.bat "-DAUTH_TOKEN_SECRET=othertokenValue"
```

For the Windows Powershell in three double quotes:

```
./optimize-startup.bat """-DAUTH_TOKEN_SECRET=othertokenValue"""
```

#### Default values

For variable placeholders it's also possible to provide default values using the following format: `${VARIABLE_NAME:DEFAULT_VALUE}`. The `DEFAULT_VALUE` can contain any character except `}`.

The following example illustrates the usage:

```
security:
  auth:
    token:
      secret: ${AUTH_TOKEN_SECRET:defaultSecret}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration
