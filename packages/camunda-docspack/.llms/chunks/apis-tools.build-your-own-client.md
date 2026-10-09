# Build your own client

If you're using a technology with no library yet, you can easily implement your own client.

Refer to the following two blog posts about creating a client:

- [Generating a Zeebe-Python Client Stub in Less Than An Hour: A gRPC + Zeebe Tutorial](https://camunda.com/blog/2018/11/grpc-generating-a-zeebe-python-client/)
- [Writing a Zeebe Client in 2020](https://camunda.com/blog/2020/06/zeebe-client-2020/)

There are two essential steps:

1. Authentication via OAuth
2. gRPC handling


## Authentication via OAuth

OAuth is a standard authentication procedure. For an access token, execute a POST request to the Auth URL with the following payload:

```json
{
  "client_id": "...",
  "client_secret": "...",
  "audience": "zeebe.camunda.io",
  "grant_type": "client_credentials"
}
```

Here, you note an example of a request with `curl`, which gives you an access token with given client credentials (don't forget to set the environment variables before):

```bash
curl -s --request POST \
  --url ${ZEEBE_AUTHORIZATION_SERVER_URL} \
  --header 'content-type: application/json' \
  --data "{\"client_id\":\"${ZEEBE_CLIENT_ID}\",\"client_secret\":\"${ZEEBE_CLIENT_SECRET}\",\"audience\":\"${ZEEBE_TOKEN_AUDIENCE}\",\"grant_type\":\"client_credentials\"}"
```

You'll receive an access token in the following format:

```json
{
  "access_token": "ey...",
  "scope": "...",
  "expires_in": 86400,
  "token_type": "Bearer"
}
```

This token is valid for 86400 seconds (24 hours). Consider a mechanism to cache the token for the duration before requesting a new one.

---
Source: https://docs.camunda.io/docs/next/apis-tools/build-your-own-client
