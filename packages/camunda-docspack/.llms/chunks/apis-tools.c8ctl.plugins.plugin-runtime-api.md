# Extend c8ctl with plugins — Plugin runtime API

At runtime, `c8ctl` injects a global object via `globalThis.c8ctl` that plugins can use to interact with the Camunda cluster and the `c8ctl` environment.

| Method/field                         | Description                                                                              |
| :----------------------------------- | :--------------------------------------------------------------------------------------- |
| `createClient(profile?, sdkConfig?)` | Create a Camunda SDK client. Optionally pass a profile name to use specific credentials. |
| `resolveTenantId(profile?)`          | Resolve the active tenant ID using the same fallback logic as built-in commands.         |
| `getLogger()`                        | Get the `c8ctl` logger instance (respects the current output mode).                      |
| `getUserDataDir()`                   | Absolute path of the `c8ctl` user data directory (honours `C8CTL_DATA_DIR`).             |
| `npm({ args, stdout?, stdio? })`     | Run npm the way `c8ctl` does, portably. See [Running npm from a plugin](#running-npm-from-a-plugin). |
| `version`                            | `c8ctl` version string.                                                                  |
| `nodeVersion`                        | Node.js version.                                                                         |
| `platform`                           | Operating system (`linux`, `darwin`, `win32`).                                           |
| `arch`                               | CPU architecture.                                                                        |
| `cwd`                                | Current working directory.                                                               |
| `outputMode`                         | Current output mode (`text` or `json`).                                                  |
| `activeProfile`                      | Name of the active profile.                                                              |
| `activeTenant`                       | Active tenant ID.                                                                        |

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/plugins
