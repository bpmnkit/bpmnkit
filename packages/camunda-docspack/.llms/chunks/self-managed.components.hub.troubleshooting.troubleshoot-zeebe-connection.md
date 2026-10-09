# Troubleshoot Zeebe connection issues

You try to connect (i.e., to deploy) to a remote Zeebe cluster and Camunda Hub reports an error.

To resolve this issue, check if you can connect to Zeebe through another client.
If that doesn't work, resolve the general connection issue first (see [the platform deployment troubleshooting section](https://docs.camunda.io/docs/next/self-managed/components/hub/troubleshooting/self-managed/operational-guides/troubleshooting), for example.)

If that works, further debug your Zeebe connection with the help of the information stated below. Enabling [debug logging in `modeler-restapi`](#how-can-i-debug-log-grpc--zeebe-communication) may also help to understand the issue.


## Zeebe connection times out

### Increase the Zeebe client timeout

Camunda Hub uses the [Zeebe Java client](https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started) to connect to Zeebe.
Depending on your infrastructure, the default timeouts configured may be too short.

You can pass custom timeouts in milliseconds for Camunda Hub's Zeebe client to `modeler-restapi` via three individual environment variables:

```shell
ZEEBE_CLIENT_REQUESTTIMEOUT=30000 # limit the time to wait for a response from the Zeebe Gateway
ZEEBE_AUTH_CONNECT_TIMEOUT=60000 # limit the time to wait for a connection to the OAuth server
ZEEBE_AUTH_READ_TIMEOUT=60000 # limits the time to wait for a response from the OAuth server
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/troubleshooting/troubleshoot-zeebe-connection
