# Troubleshoot database connection issues — Secure connection to standard PostgreSQL

Refer to the [database configuration guide](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database#configuring-ssl-for-the-database-connection)
for details on how to configure a secure connection to PostgreSQL.


## Secure connection to Amazon Aurora fails

You configured a custom SSL certificate in your remote Amazon Aurora PostgreSQL instance and want Camunda Hub to accept
that certificate.

### Add Amazon Root CA to trust store

By default, the Java version used by `modeler-restapi` ships with the Amazon Root CA.

If you passed a custom trust store to `modeler-restapi`'s JVM process (e.g. via `JAVA_TOOL_OPTIONS` as described in
[the Zeebe connection troubleshooting guide](https://docs.camunda.io/docs/next/self-managed/components/hub/troubleshooting/troubleshoot-zeebe-connection#provide-the-certificate-to-the-jvm-trust-store)),
ensure the Amazon Trust Services CA are in `modeler-restapi`'s trust store (see the
[Amazon Aurora documentation](https://aws.amazon.com/blogs/security/how-to-prepare-for-aws-move-to-its-own-certificate-authority/)).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/troubleshooting/troubleshoot-database-connection
