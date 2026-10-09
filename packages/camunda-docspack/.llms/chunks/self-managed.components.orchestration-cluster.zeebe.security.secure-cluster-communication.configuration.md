# Secure cluster communication — Configuration

To enable TLS for cluster communication, provide a certificate chain and a private key.

Two mutually exclusive formats can be provided, and attempting to use both at the same time will result in an error.

### Keystore file

A keystore file can be provided. Currently, this only supports PKCS#12. Per the [RFC](https://datatracker.ietf.org/doc/html/rfc7292) it must:

- Not have more than **one** certificate-key entry in the file.
- Have the same password for the keystore and the key password of the only entry.

The certificate will remain the same as the PEM certificate approach, and it should be an x.509 public certificate. The private key must also be generated using PKCS#8.

### PEM certificate and keys

The certificate chain file is expected to be a PEM public certificate file, which should contain a x509 public certificate, and may additionally contain an entire certificate chain. If it does include the chain, it should simply be concatenated after the node's certificate.

For example, a simple certificate file with only a single certificate:

```
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
```

If you wanted to include its signing authority, for example, you would append the contents of the authority's public certificate to the end of the certificate chain file:

```
-----BEGIN CERTIFICATE-----
...
-----END CERTIFICATE-----
-----BEGIN TRUSTED CERTIFICATE-----
...
-----END TRUSTED CERTIFICATE-----
```

While each node uses the default Java trust store to verify incoming certificates (configurable via `javax.net.ssl.trustStore`), which by default uses the system's root certificates, it's recommended to include the complete certificate chain in the file. These will also be used by each node to verify the other nodes' certificates.

**Note**
More specifically, the certificate chain will be part of the trust store of the node, and will be used to verify other node's certificates.

This will allow you to configure each node with a different leaf certificate sharing the same root certificate (or at least an intermediate authority), as long as they're contained in the chain. If all nodes use the same certificate, or if you're certain the certificate is trusted by the root certificates available on each node, it's sufficient for the file to only contain the leaf certificate.

The private key file should be a PEM private key file, and should be the one during generation of the node's public certificate. Algorithms supported for the private keys are RSA, DSA, and EC. The private key must be generated using [PKCS8](https://datatracker.ietf.org/doc/html/rfc5208) or [PKCS #1](https://datatracker.ietf.org/doc/html/rfc2437); any other format will not work with Zeebe. If you're unsure what format your private key is, you can quickly run it through the `openssl` utility to convert it to PKCS8:

```shell
> openssl pkcs8 -topk8 -nocrypt -in my_private_key -out my_private_pkcs8_key.pem
```

Remove the `-nocrypt` parameter if your private key has a password. If your certificate is already in the right format, it will simply do nothing. See the [OpenSSL manpages](https://www.openssl.org/docs/man1.1.1/man1/openssl-pkcs8.html) for more options.

**Caution**

Note that currently, Zeebe does not support password protected private keys. Since storing the certificates and private keys unencrypted on disk is a security risk, we recommend you use a secret management solution like Vault to inject your certificates in memory at runtime.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/secure-cluster-communication
