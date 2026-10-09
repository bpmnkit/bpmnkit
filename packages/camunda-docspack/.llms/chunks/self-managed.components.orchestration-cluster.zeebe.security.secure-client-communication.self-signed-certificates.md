# Secure client communication — Self signed certificates

It may be useful, for testing or development purposes, to use TLS between the client and the gateway; to simplify things, we can use self-signed certificates for this.

### Testing & example

To generate your own self-signed certificates for testing/development, you will need `openssl` install on your local machine. Then you can run:

```sh
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365 --nodes -addext 'subjectAltName=IP:127.0.0.1'
```

This will generate a new certificate, `cert.pem`, and a new passwordless key, `key.pem`.

**Danger**
Do not use these in production! Again, this is for development and testing purposes only.

Then start up your gateway with the certificate and key specified above. For example, if we run a broker with an embedded gateway directly using Docker:

```sh
docker run -p 26500:26500 -e ZEEBE_BROKER_NETWORK_HOST=0.0.0.0 -e ZEEBE_BROKER_GATEWAY_SECURITY_ENABLED=true -e ZEEBE_BROKER_GATEWAY_SECURITY_CERTIFICATECHAINPATH=/usr/local/zeebe/cert.pem -e ZEEBE_BROKER_GATEWAY_SECURITY_PRIVATEKEYPATH=/usr/local/zeebe/key.pem --mount type=bind,source="$(pwd)"/cert.pem,target=/usr/local/zeebe/cert.pem --mount type=bind,source="$(pwd)"/key.pem,target=/usr/local/zeebe/key.pem camunda/zeebe
```

There is one caveat: in order for the client to accept this self-signed certificate, you will need to trust it. The simplest way is to specify it as part of the client's configuration. Refer to the documentation above on how to configure your clients.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/secure-client-communication
