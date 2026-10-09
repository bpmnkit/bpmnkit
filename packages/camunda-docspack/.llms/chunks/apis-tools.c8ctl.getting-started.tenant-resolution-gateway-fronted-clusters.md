# c8ctl CLI — Tenant resolution — Gateway-fronted clusters

For a cluster reached through an API gateway or reverse proxy, a profile can attach a custom header to every request and target `--baseUrl` exactly, without `c8ctl`'s automatic `/v2` suffixing:

```bash
# Attach a header (e.g. an API key) to every REST request made under this profile.
# Repeat --header to attach more than one.
c8 add profile gateway \
  --baseUrl=https://gateway.example.com/camunda-api \
  --header "X-Api-Key: your-api-key" \
  --header "X-Correlation-Id: your-correlation-id"

# --exactBaseUrl: use --baseUrl as the exact request path instead of
# appending /v2 (the default for self-managed profiles).
c8 add profile gateway-exact \
  --baseUrl=https://gateway.example.com/camunda-api \
  --exactBaseUrl
```

Both flags are optional and independent of each other. A profile that sets neither behaves exactly as before.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started
