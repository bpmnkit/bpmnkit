# Self-signed TLS / mTLS

# Self-signed TLS / mTLS

The SDK supports custom TLS certificates via environment variables. This is useful for:

- **Self-signed server certificates** — trust a CA that signed your server's certificate, without presenting a client identity.
- **Mutual TLS (mTLS)** — present a client certificate and key to prove the client's identity.
- **Both** — trust a custom CA _and_ present client credentials.


## Trusting a self-signed server certificate

Set only the CA certificate to trust the server's self-signed certificate:

```bash
# Path to PEM file:
CAMUNDA_MTLS_CA_PATH=/path/to/ca.pem

# Or inline PEM:
CAMUNDA_MTLS_CA="-----BEGIN CERTIFICATE-----\n..."
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/self-signed-tls-mtls
