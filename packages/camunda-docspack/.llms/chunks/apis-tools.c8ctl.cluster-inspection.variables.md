# Cluster inspection and process management — Variables

### Set variables

Set variables on a process instance or a specific flow element scope using its element instance key:

```bash
# Set variables on a process instance (propagated to the outermost scope by default)
c8 set variable 2251799813685249 --variables='{"status":"approved","amount":100}'

# Set variables in the local scope only (not propagated to the parent scope)
c8 set variable 2251799813685249 --variables='{"localCounter":1}' --local
```

The `--variables` flag accepts a JSON object. Use `--local` to restrict the update to the specified element instance scope instead of propagating to the outermost scope.

Every command that takes `--variables` also accepts `@file.json` to read the JSON from a file and `@-` to read it from stdin. Prefer these when the payload is large or contains quotes — some shells (notably PowerShell) strip or re-split the quotes of inline JSON before the CLI ever sees it:

```bash
c8 complete job 2251799813685252 --variables=@vars.json
Get-Content vars.json | c8 complete job 2251799813685252 --variables=@-
```

When inline JSON arrives with all of its quotes stripped (`{a:b}` instead of `{"a":"b"}`), c8ctl restores them and prints a warning showing the payload it recovered. Restoration is best-effort: it cannot tell `{"a":1}` from `{"a":"1"}`, and it fails outright when a stripped string contained a `:` or `,` of its own. Use `@file.json` or `@-` for anything non-trivial.

The element instance key is the key of the process instance or the specific flow element scope you want to update. You can retrieve these keys from `c8 get pi` or `c8 search pi`.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
