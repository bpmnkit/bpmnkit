# Property reference — Security — `CAMUNDA_SECURITY_HTTPHEADERS` (2)

#### Default Content Security Policy

This is default value of the Content Security Policy when enabled:

```
default-src 'self';
base-uri 'self';
script-src 'self' https: *.chargebee.com *.mixpanel.com ajax.cloudflare.com static.cloudflareinsights.com;
script-src-elem 'self' cdn.jsdelivr.net ;
connect-src 'self' https: *.mixpanel.com cloudflareinsights.com *.appcues.net wss://api.appcues.net cdn.jsdelivr.net;
style-src 'self' https: 'unsafe-inline' cdn.jsdelivr.net *.googleapis.com *.chargebee.com;
img-src data: 'self';
form-action 'self';
frame-ancestors 'self';
frame-src 'self' https: *.chargebee.com blob: ;
object-src 'self' blob:;
font-src 'self' data: fonts.camunda.io cdn.jsdelivr.net;
worker-src 'self' blob:;
child-src;
script-src-attr 'none'.
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
