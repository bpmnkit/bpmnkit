# Properties reference — `camunda.client.auth`

Properties for authenticating the Camunda client.

  
    Property
    Description
    Default value
  

  

The resource for which the access token must be valid. A default is set by `camunda.client.mode: saas` and `camunda.client.auth.method: oidc`.

Type: string

  null

  

The client ID to use when requesting an access token from the OAuth authorization server.

Type: string

  null

  

The client secret to use when requesting an access token from the OAuth authorization server.

Type: string

  null

  

The connection timeout for requests to the OAuth credentials provider.

Type: duration

  &quot;PT5S&quot;

  

The path to the credentials cache file. If unset or empty, the OAuth provider caches credentials only in memory and does not persist them across restarts. Set this to a writable path to opt in to persistent file-based caching. See issue #13124.

Type: string

  null

  

The url of the issuer for the access token. It is used to generate the well-known configuration url from which the `token-url` is retrieved. Only applied if the `camunda.client.auth.well-known-configuration-url` is not set. A default is set by `camunda.client.auth.method: oidc`.

Type: url

  null

  

The keystore key password for the OAuth identity provider.

Type: string

  null

  

The keystore password for the OAuth identity provider.

Type: string

  null

  

The path to the keystore for the OAuth identity provider.

Type: file

  null

  

The authentication method to use. If not set, it is detected based on the presence of a username, password, client ID, and client secret. A default is set by `camunda.client.mode: saas`.

Type: enum[none, basic, oidc]

  null

  

The password to be use for basic authentication. A default is set by `camunda.client.auth.method: basic`.

Type: string

  null

  

Controls how far before token expiry a background refresh is triggered. The token remains valid within this window, so callers don't block on a synchronous refresh at expiry. Must be strictly greater than the internal expiry grace period.

Type: duration

  &quot;PT30S&quot;

  

The data read timeout for requests to the OAuth credentials provider.

Type: duration

  &quot;PT5S&quot;

  

The resource for which the access token must be valid.

Type: string

  null

  

The scopes of the access token.

Type: string

  null

  

The multiplier applied to the backoff duration between successive token fetch retry attempts. Must be greater than or equal to 1.0.

Type: double

  2

  

The initial backoff duration applied between token fetch retry attempts. Each subsequent delay is multiplied by `camunda.client.auth.token-fetch-backoff-multiplier`.

Type: duration

  &quot;PT1S&quot;

  

The maximum number of attempts (including the initial one) when fetching a token from the OAuth authorization server. Retries are only attempted on IOException or HTTP status codes configured via `token-fetch-retryable-status-codes`.

Type: integer

  5

  

If the token endpoint returns a non-retryable response, subsequent token fetch attempts fail immediately without making a request. This property specifies the duration of this cooldown period. After the cooldown period elapses, the next request retries; if it also fails with a non-retryable error, the cooldown resets. Set to `duration.zero` to disable the cooldown.

Type: duration

  &quot;PT5M&quot;

  

The set of HTTP status codes from the token endpoint that are retried with backoff. Any other non-200 status code triggers the `camunda.client.auth.token-fetch-non-retryable-cooldown` cooldown.

Type: array[integer]

  [404,429,500,502,503,504]

  

The authorization server URL from which to request the access token. A default is set by `camunda.client.mode: saas`.

Type: url

  null

  

The truststore password for the OAuth identity provider.

Type: string

  null

  

The path to the truststore for the OAuth identity provider.

Type: file

  null

  

The username to use for basic authentication. A default is set by `camunda.client.auth.method: basic`.

Type: string

  null

  

The url of the well-known configuration of the issuer. It is used to retrieve the `token-url`. Only applied if `camunda.client.auth.token-url` is not set.

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/properties-reference
