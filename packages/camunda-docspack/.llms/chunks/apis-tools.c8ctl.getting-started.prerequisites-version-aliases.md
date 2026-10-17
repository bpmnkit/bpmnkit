# c8ctl CLI — Prerequisites — Version aliases

The `stable` and `alpha` aliases are resolved dynamically from the [Camunda Download Center](https://downloads.camunda.cloud/release/camunda/c8run/):

| Alias    | Resolves to                                              |
| :------- | :------------------------------------------------------- |
| `stable` | Highest minor release that is GA (for example, 8.9)      |
| `alpha`  | Highest minor release overall (for example, 8.10-alpha0) |

When no version is specified, `c8 cluster start` defaults to `stable`.

A `<major>.<minor>` version like `8.8` is treated as a rolling release — the download server directory is updated in-place with new patch releases. `c8 cluster start` uses the local version if available, while `c8 cluster install` always checks for a newer version.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started
