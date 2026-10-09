# Self-signed TLS / mTLS — Mutual TLS (client certificate)

To present a client certificate for mutual TLS, provide both the certificate and private key:

```bash
CAMUNDA_MTLS_CERT_PATH=/path/to/client.crt
CAMUNDA_MTLS_KEY_PATH=/path/to/client.key

# Optional — passphrase if the key is encrypted:
# CAMUNDA_MTLS_KEY_PASSPHRASE=secret
```


## Full mTLS with custom CA

Combine a custom CA with client credentials:

```bash
CAMUNDA_MTLS_CA_PATH=/path/to/ca.pem
CAMUNDA_MTLS_CERT_PATH=/path/to/client.crt
CAMUNDA_MTLS_KEY_PATH=/path/to/client.key
```

Inline PEM values (`CAMUNDA_MTLS_CERT`, `CAMUNDA_MTLS_KEY`, `CAMUNDA_MTLS_CA`) take precedence over their `_PATH` counterparts. TLS is applied to all outbound calls, including OAuth token requests.

No code changes are needed — the SDK picks up TLS configuration from environment variables automatically:

<!-- snippet-exempt: trivial env-var usage illustration -->

```csharp
using Camunda.Orchestration.Sdk;

var client = CamundaClient.Create(); // TLS configured from env vars
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/self-signed-tls-mtls
