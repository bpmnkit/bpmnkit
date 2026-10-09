# Configuration — Multi-tenancy — Outbound connector config

The Connector Runtime uses the default tenant for outbound connector-related features.
If support for a different tenant or multiple tenants should be enabled, the tenants need
to be configured individually using the following environment variables.

If you want to use outbound connectors for a single tenant that is different
from the default tenant, you can specify a different default tenant ID using:

```bash
CAMUNDA_CLIENT_TENANTID=myTenant
```

This will change the default tenant ID used for fetching jobs and publishing messages
to the tenant ID `myTenant`.

It is possible to adjust the polling interval of connectors polling process definitions to Operate by setting the environment variable `CAMUNDA_CONNECTOR_POLLING_INTERVAL`. This variable allows you to control how often connectors fetch the process definitions, with the interval specified in milliseconds. For example, setting `CAMUNDA_CONNECTOR_POLLING_INTERVAL=20000` will configure the connectors to poll every 20 seconds.

Example:

```bash
CAMUNDA_CONNECTOR_POLLING_INTERVAL=10000
```

**Note**
Inbound connectors will still be enabled for
all tenants the Connector Runtime client has access to.

To run the connector Runtime in a setup where a single runtime
serves multiple tenants, add each tenant ID to the list of the default job workers:

```bash
CAMUNDA_CLIENT_ZEEBE_DEFAULTS_TENANTIDS=`myTenant, otherTenant`
```

In this case, the `CAMUNDA_CLIENT_TENANTID` will **not** be used for the
configuration of job workers.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
