# Configuration — Programmatic configuration

```php
function readme_programmatic_config(): void
{
    $config = new CamundaConfiguration(
        restAddress: 'https://my-cluster.example.com/v2',
        authStrategy: 'OAUTH',
        clientId: 'my-client-id',
        clientSecret: 'my-client-secret',
    );

    $client = CamundaClient::fromConfiguration($config);
}
```


## Basic auth

```php
function readme_basic_auth(): void
{
    $client = CamundaClient::fromEnvironment([
        'CAMUNDA_AUTH_STRATEGY' => 'BASIC',
        'CAMUNDA_BASIC_AUTH_USERNAME' => 'demo',
        'CAMUNDA_BASIC_AUTH_PASSWORD' => 'demo',
    ]);
}
```


## Loading a `.env` file

Set `CAMUNDA_LOAD_ENVFILE=true` to read `.env` in the working directory, or set
it to an explicit path. This optional capability requires
[`vlucas/phpdotenv`](https://packagist.org/packages/vlucas/phpdotenv).

```php
function env_file_client(): CamundaClient
{
    // Set CAMUNDA_LOAD_ENVFILE=true (or a path) before starting PHP. Real
    // environment variables and explicit overrides still take precedence.
    return CamundaClient::fromEnvironment();
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/php-sdk/configuration
