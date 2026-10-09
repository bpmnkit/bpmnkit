# Get started with the catalog — Organize your assets — Define the asset README

The README is the asset's metadata file. Camunda Hub detects an asset by the presence of a README with valid frontmatter:

| Field      | Type            | Required | Description                                                                                                              |
| ---------- | --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `template` | string          | Yes      | File name of the element template in the same directory. If the file is missing, the submission fails.                   |
| `category` | string          | No       | Groups the asset under a single category for filtering in the catalog. If omitted, the asset won't belong to a category. |
| `tags`     | list of strings | No       | Tags used to search and filter assets in the catalog. If omitted, the asset will have no tags.                           |

Other information about the asset, such as its name, short description, and icon are _not_ set in the frontmatter. They come from the `name`, `description`, and `icon` fields of the element template file.

The Markdown content below the frontmatter is displayed as the asset description when browsing the catalog in Hub.

Here's a full example `README.md`:

```markdown
---
template: payment-connector.json
category: Payments
tags:
  - payments
  - connector
---

## Payment Connector

This connector integrates with the company payment gateway.
It handles payment initiation, status checks, and refund processing.

### Usage

Apply this template to a Service task to configure a payment operation.
```

The README supports Markdown text only. Embedded images and videos are not supported at this time.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-catalog/getting-started
