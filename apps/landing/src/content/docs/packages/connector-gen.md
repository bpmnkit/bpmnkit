---
title: "@bpmnkit/connector-gen"
description: Generate Camunda REST connector element templates from OpenAPI 3.x and Swagger 2.x specs.
sidebar:
  order: 7
---

## Overview

`@bpmnkit/connector-gen` parses OpenAPI 3.x and Swagger 2.x specifications and generates Camunda
REST connector element templates — the `.json` files imported into Camunda Modeler to pre-configure
`bpmn:ServiceTask` nodes.

- **OpenAPI 3.x and Swagger 2.x** — JSON and YAML
- **One template per operation** — method, URL, params, body, auth, output, retries all wired up
- **100-entry built-in catalog** — GitHub, Stripe, Slack, Xero, DocuSign, Adyen, and more
- **Auth auto-detection** — reads `components.securitySchemes` and pre-selects the right auth block
- **FEEL expressions** — path parameters become `="https://base/"+param` expressions automatically
- **Body expansion** — optionally decompose request body properties into individual typed fields
- Zero dependencies beyond `yaml` for YAML parsing

To try it without installing anything, drop a spec into the
[connector generator](/connector-generator) on this site — it runs this package in the browser.

## Installation

```sh
pnpm add @bpmnkit/connector-gen
```

## Quick start

```typescript
import { generate, writeTemplates } from "@bpmnkit/connector-gen"
import { readFileSync } from "node:fs"

const spec = readFileSync("openapi.yaml", "utf8")

const templates = generate(spec, {
  idPrefix: "com.myorg",
})

await writeTemplates(templates, { outputDir: "./templates" })
// Writes one .json file per operation into ./templates/
```

## Generating from a URL

```typescript
import { generateFromUrl } from "@bpmnkit/connector-gen"

const { templates, files } = await generateFromUrl(
  "https://raw.githubusercontent.com/openai/openai-openapi/master/openapi.yaml",
  {
    idPrefix: "com.myorg",
    outputDir: "./templates",
  }
)

console.log(`Wrote ${files.length} templates`)
```

## Generating from the catalog

The built-in catalog provides spec URLs and auth defaults for 100 popular APIs:

```typescript
import { generateFromCatalog } from "@bpmnkit/connector-gen"

// Use catalog defaults
const { templates, files, entry } = await generateFromCatalog("stripe", {
  outputDir: "./templates",
})

// Override catalog defaults
await generateFromCatalog("github", {
  outputDir: "./templates",
  idPrefix: "com.myorg",
  defaultAuthType: "bearer",
  filter: "issues|pulls",
  expandBody: true,
})
```

## `GeneratorOptions`

| Option | Type | Description |
|---|---|---|
| `idPrefix` | `string` | Reverse-DNS prefix for template IDs, e.g. `"io.mycompany"` |
| `defaultAuthType` | `AuthHint` | Pre-select auth type; auto-detected from spec if omitted |
| `baseUrl` | `string` | Override the base URL from `servers[0].url` in the spec |
| `expandBody` | `boolean` | Decompose top-level body properties into individual typed fields |
| `filter` | `string` | Regex applied to `operationId` and `summary` to filter operations |

```typescript
type AuthHint =
  | "noAuth"
  | "apiKey"
  | "basic"
  | "bearer"
  | "oauth-client-credentials-flow"
```

## `WriteOptions`

| Option | Type | Description |
|---|---|---|
| `outputDir` | `string` | Directory to write `.json` files into |
| `format` | `"one-per-op" \| "array"` | One file per operation (default) or all in one array file |

## Auth blocks

Every generated template includes a full 5-type auth block with visibility conditions, so users can
switch auth method in Camunda Modeler without editing the file.

| `AuthHint` | Fields in the template |
|---|---|
| `noAuth` | No auth fields shown |
| `apiKey` | `API Key` String field (sent as a header) |
| `basic` | `Username` + `Password` fields (HTTP Basic) |
| `bearer` | `Bearer Token` String field |
| `oauth-client-credentials-flow` | `Client ID`, `Client Secret`, `Token URL`, `Scopes` |

Auth is auto-detected from `components.securitySchemes`. The detected or specified type is
pre-selected in the template dropdown.

## Body expansion

By default the request body is a single FEEL `Text` field accepting a JSON expression. With
`expandBody: true`, top-level properties of the request body schema become individual typed input
fields — `String`, `Number`, or `Boolean`:

```typescript
// Default: one body field
generate(spec, { idPrefix: "com.myorg" })
// → body: Text (FEEL expression)

// Expanded: one field per top-level body property
generate(spec, { idPrefix: "com.myorg", expandBody: true })
// → to: String, subject: String, html: String, ...
```

## Lower-level API

All internals are exported if you need fine-grained control:

```typescript
import {
  parseOpenApi,       // parse YAML or JSON string → OpenApiDoc
  getOperations,      // enumerate all operations with resolved params and schemas
  detectDefaultAuth,  // infer AuthHint from components.securitySchemes
  buildTemplate,      // build one ConnectorTemplate from one OperationWithMeta
  buildTemplates,     // build all templates from all operations
  writeTemplates,     // write ConnectorTemplate[] to disk
} from "@bpmnkit/connector-gen"

const doc = parseOpenApi(specText)
const auth = detectDefaultAuth(doc)           // "bearer" | "apiKey" | ...
const ops = getOperations(doc, "createUser")  // filter regex optional

const templates = buildTemplates(ops, {
  idPrefix: "com.myorg",
  defaultAuthType: auth,
})

await writeTemplates(templates, {
  outputDir: "./out",
  format: "array",  // all in one file
})
```

## API index

`@bpmnkit/connector-gen/api-index` is an offline index of the catalog's HTTP APIs. It is built
from their OpenAPI specs, so nothing is fetched at runtime. It holds about 80 services and
20,000 operations. For each service it keeps the base URL and how it authenticates. For each
operation it keeps:

- the method and path;
- a summary of twelve words at most;
- the query parameters, top-level body fields and required headers, required ones marked `*`.

Each service is its own module, so loading Stripe evaluates only Stripe:

```typescript
import { API_SERVICES, loadApiService } from "@bpmnkit/connector-gen/api-index"

API_SERVICES.map((s) => s.id)            // ["github", "cloudflare", "stripe", "notion", …]
const stripe = await loadApiService("stripe")
stripe?.baseUrl                          // "https://api.stripe.com"
stripe?.operations.find((o) => o.path === "/v1/customers" && o.method === "POST")
// { method: "POST", path: "/v1/customers", summary: "Create a customer",
//   body: ["name", "email", "description", …], form: true }
```

[`@bpmnkit/core/connectors`](/docs/packages/connectors#api-cards) turns these into **API
cards** for a model, and completes REST connector calls from them. `casen connector api
"create a stripe customer"` prints the cards.

- **Building.** `pnpm update-api-index` (`scripts/build-api-index.mjs`) fetches each catalog
  spec once. It reads OpenAPI 3 and Swagger 2.
  - The weekly connector-templates workflow runs it and opens a pull request when something
    changed.
  - A spec that cannot be fetched keeps its previous entry.
- **Base URLs.** A spec whose host stands for a tenant's own, like Jira's
  `your-domain.atlassian.net`, has no `baseUrl`; the call needs the full URL.
- **Licenses.** Only specs under a permissive license, or none stated, are indexed. A spec
  that names a non-commercial, copyleft or proprietary license is left out.

## Catalog reference

Use `CATALOG` and `getCatalogEntry` to inspect or extend the catalog programmatically:

```typescript
import { CATALOG, getCatalogEntry } from "@bpmnkit/connector-gen"

// List all entries
for (const entry of CATALOG) {
  console.log(entry.id, entry.name, entry.defaultAuth)
}

// Look up one entry
const stripe = getCatalogEntry("stripe")
// → { id: "stripe", name: "Stripe API", url: "...", idPrefix: "io.stripe", defaultAuth: "basic" }
```

### Built-in entries

| ID | Name | Default auth |
|---|---|---|
| `github` | GitHub REST API | bearer |
| `cloudflare` | Cloudflare API | bearer |
| `stripe` | Stripe API | basic |
| `notion` | Notion API | bearer |
| `resend` | Resend Email API | bearer |
| `openai` | OpenAI API | bearer |
| `figma` | Figma API | bearer |
| `twilio` | Twilio Messaging API | basic |
| `slack` | Slack Web API | bearer |
| `jira` | Atlassian Jira API | bearer |
| `hubspot` | HubSpot CRM API | oauth-client-credentials-flow |
| `discord` | Discord API | bearer |
| `pagerduty` | PagerDuty API | apiKey |
| `zoom` | Zoom API | oauth-client-credentials-flow |
| `mailchimp` | Mailchimp API | apiKey |
| `asana` | Asana API | bearer |
| `sendgrid` | SendGrid Mail API | bearer |
| `paypal` | PayPal Payments API | oauth-client-credentials-flow |
| `plaid` | Plaid API | apiKey |
| `vercel` | Vercel API | bearer |
| `anthropic` | Anthropic API | apiKey |
| `shopify` | Shopify Admin API | bearer |
| `datadog` | Datadog API | apiKey |
| `sentry` | Sentry API | bearer |
| `intercom` | Intercom API | bearer |
| `contentful` | Contentful Management API | bearer |
| `airtable` | Airtable API | bearer |
| `twitch` | Twitch Helix API | oauth-client-credentials-flow |
| `klaviyo` | Klaviyo API | apiKey |
| `brex` | Brex API | oauth-client-credentials-flow |

## `CatalogEntry` type

```typescript
interface CatalogEntry {
  id: string
  name: string
  description: string
  url: string           // OpenAPI spec download URL
  idPrefix: string      // suggested reverse-DNS prefix
  defaultAuth: AuthHint
}
```

## CLI

The same functionality is available via `casen connector generate` and `casen connector catalog`.
See the [CLI reference](/docs/cli/connector).
