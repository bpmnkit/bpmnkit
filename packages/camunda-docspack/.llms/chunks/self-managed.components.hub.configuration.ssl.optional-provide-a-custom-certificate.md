# SSL — (Optional) Provide a custom certificate

If you are using a custom (self-signed) TLS certificate for either the `restapi` or Identity, you need to make Camunda Hub accept the certificate.
For the `modeler-restapi` container:

- Add the certificate to a custom Java trust store (using the [`keytool`](https://docs.oracle.com/en/java/javase/21/docs/specs/man/keytool.html) utility).
- Configure the trust store as described in the [Zeebe connection troubleshooting guide](https://docs.camunda.io/docs/next/self-managed/components/hub/troubleshooting/troubleshoot-zeebe-connection#provide-the-certificate-to-the-jvm-trust-store).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/ssl
