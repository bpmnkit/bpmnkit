# Configuration — Mutual TLS

```php
function mtls_client(): CamundaClient
{
    return CamundaClient::fromConfiguration(new CamundaConfiguration(
        restAddress: 'https://my-cluster.example.com/v2',
        authStrategy: 'OAUTH',
        clientId: 'my-client-id',
        clientSecret: 'my-client-secret',
        mtlsCertPath: '/run/secrets/client.crt',
        mtlsKeyPath: '/run/secrets/client.key',
        mtlsCaPath: '/run/secrets/cluster-ca.pem',
    ));
}
```


## Custom Guzzle middleware

```php
function custom_http_client(CamundaConfiguration $configuration): CamundaClient
{
    // Supplying a Guzzle client replaces the SDK-built stack. Add the SDK auth
    // middleware and any proxy, tracing, or mTLS options your application needs.
    $stack = HandlerStack::create();
    $stack->push(new AuthMiddleware(AuthProviderFactory::fromConfiguration($configuration)), 'camunda_auth');

    return CamundaClient::fromConfiguration(
        $configuration,
        new GuzzleClient(['handler' => $stack, 'http_errors' => false]),
    );
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/php-sdk/configuration
