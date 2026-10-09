# Extend c8ctl with plugins — Plugin runtime API — Running npm from a plugin

Spawning npm directly is not portable. On Windows npm is a `npm.cmd` shim: a bare `npm` spawn fails with `ENOENT`, and `npm.cmd` alone fails with `EINVAL` under the CVE-2024-27980 hardening in Node 18.20.2 / 20.12.2 / 21.7.3 and later. `c8ctl.npm()` is the same helper the CLI uses for its own plugin installs — it routes the call through `cmd.exe` with every argument quoted (plugin paths routinely contain spaces) and rejects arguments that cannot be passed safely: an embedded `"`, a line break, or a `%VAR%` reference.

```typescript
import type { C8ctlPluginRuntime } from "@camunda8/cli/runtime";

const c8ctl: C8ctlPluginRuntime | undefined = globalThis.c8ctl;
if (!c8ctl) throw new Error("c8ctl runtime is not available");
// Capture stdout
const { stdout } = c8ctl.npm({ args: ["view", "c8ctl-plugin-foo", "version"], stdout: true });

// Stream to the terminal instead
c8ctl.npm({ args: ["install", "c8ctl-plugin-foo"], stdio: "inherit" });
```

`stdout: true` returns `{ stdout: string }`; omitting it returns `undefined`. A non-zero npm exit throws.

#### Installing into a directory with `--prefix`

`npm install --prefix <dir>` with no package spec misbehaves on Windows: npm applies the CLI `--prefix` to the global prefix too, and because the Windows global install root is `<prefix>\node_modules` (rather than `<prefix>/lib/node_modules` as on POSIX) npm decides the install is global, rewrites the empty argument list to `.`, and resolves that against the process cwd — so it reads the wrong `package.json` ([#526](https://github.com/camunda/c8ctl/issues/526)). `c8ctl.npm()` detects this exact shape on Windows and instead runs npm with its cwd set to the prefix directory, which is equivalent and correct. Plugins do not need to change their cwd or use an npm-specific option form, and POSIX invocations are untouched. The re-scope is bounded (`--workspaces=false`) so npm resolves exactly that directory rather than promoting the install to a workspace root above it, and a prefix that is itself a workspace root is left untouched.

```typescript
// Works the same on Linux, macOS and Windows
c8ctl.npm({ args: ["install", "--prefix", projectDir], stdout: true });
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/plugins
