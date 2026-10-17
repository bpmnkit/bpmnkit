# TypeScript SDK — Get started

Get started with the Orchestration Cluster API.

1. Create a new Node.js project that uses TypeScript:

   ```bash
   npm init -y
   npm install -D typescript
   npx tsc --init
   ```

2. Install the SDK as a dependency:

   ```bash
   npm i @camunda8/sdk
   ```

**Info**

- A complete working version of the quickstart code is [available on GitHub](https://github.com/camunda-community-hub/c8-sdk-demo).
- For earlier versions (Camunda 8.7 and below), refer to the [SDK README file](https://github.com/camunda/camunda-8-js-sdk).


## Configure the connection

Choose one of the following configuration options:

- Explicit configuration in code
- Zero-configuration constructor with environment variables

The recommended configuration is via the zero-configuration constructor, with all values for configuration supplied via environment variables. This makes rotation, secret management, and environment promotion safer and simpler.

**The environment variables you must set are outlined below. Replace these with your secrets and URLs.**

**Info**
To configure a client and capture these values when creating the client, see [setting up client connection credentials](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients#create-a-client).

### Self-managed configuration

Minimal configuration:

```bash
# Self-Managed with Orchestration Cluster API
export ZEEBE_REST_ADDRESS='http://localhost:8080/v2'
```

With OAuth:

```bash
export ZEEBE_REST_ADDRESS='http://localhost:8080/v2'
export ZEEBE_GRPC_ADDRESS='grpc://localhost:26500'
export ZEEBE_CLIENT_ID='zeebe'
export ZEEBE_CLIENT_SECRET='zecret'
export CAMUNDA_OAUTH_URL='http://localhost:18080/auth/realms/camunda-platform/protocol/openid-connect/token'
```

If you are running with multi-tenancy enabled:

```bash
export CAMUNDA_TENANT_ID='my-tenant' # tenant <default> used by default if none set
```

### Camunda SaaS configuration

```bash
export ZEEBE_REST_ADDRESS='5c34c0a7-...-125615f7a9b9.syd-1.zeebe.camunda.io'
export ZEEBE_GRPC_ADDRESS='grpcs://5c34c0a7-...-125615f7a9b9.syd-1.zeebe.camunda.io:443'
export ZEEBE_CLIENT_ID='yvvURO...'
export ZEEBE_CLIENT_SECRET='iJJu-SHg...'
export CAMUNDA_OAUTH_URL='https://login.cloud.camunda.io/oauth/token'
```

**Caution**
To set these values explicitly in code (not recommended), pass them with the same key names to the `Camunda8` constructor.

---
Source: https://docs.camunda.io/docs/next/apis-tools/typescript/camunda8-sdk
