# Command reference — Resource Aliases

| Alias | Resource |
|-------|----------|
| `auth` | `authorization` |
| `inc` | `incident` |
| `mr` | `mapping-rule` |
| `msg` | `message` |
| `pd` | `process-definition` |
| `pi` | `process-instance` |
| `ut` | `user-task` |
| `vars` | `variable` |
| `var` | `variable` |
| `ws` | `wait-state` |


## Search Flags

These flags are available on `list` and `search` commands.

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--sortBy` | string |  | Sort results by field |
| `--asc` | boolean |  | Sort ascending |
| `--desc` | boolean |  | Sort descending |
| `--limit` | string |  | Maximum number of results |
| `--between` | string |  | Date range filter (e.g. 2024-01-01..2024-12-31, ..2024-12-31, 2024-01-01..) |
| `--dateField` | string |  | Date field for --between filter |

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
