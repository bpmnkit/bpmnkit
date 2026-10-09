# Configure Camunda 8 Run — Manage local secrets

c8run stores local secret values in your platform's user data directory and configures the file secret store automatically.

| Platform | Default directory                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| Linux    | `${XDG_DATA_HOME}/camunda/c8run/secrets`, or `~/.local/share/camunda/c8run/secrets` when `XDG_DATA_HOME` isn't set |
| macOS    | `~/Library/Application Support/Camunda/C8Run/secrets`                                                              |
| Windows  | `%LOCALAPPDATA%\Camunda\C8Run\secrets`                                                                             |

Run `./c8run secrets path` to print the directory used by the current environment.

Set a secret without placing the value in your command history:

```bash
./c8run secrets set OPENAI_API_KEY
```

Enter the value at the hidden prompt. Then reference it in Process Models with:

```feel
=camunda.secrets.OPENAI_API_KEY
```

To set several secrets without creating a dotenv file, pass multiple names. Camunda 8 Run prompts for each value separately:

```bash
./c8run secrets set OPENAI_API_KEY SLACK_TOKEN
```

Secret names can contain letters, numbers, underscores, and dashes. In a FEEL expression, wrap a name containing dashes in backticks:

```feel
=camunda.secrets.`openai-api-key`
```

Use the following commands to manage values:

| Command                                | Purpose                                          |
| -------------------------------------- | ------------------------------------------------ |
| `./c8run secrets set <name> [name...]` | Prompt for and save one or more values.          |
| `./c8run secrets set <name> --stdin`   | Read a value from standard input for automation. |
| `./c8run secrets list`                 | List secret names without showing their values.  |
| `./c8run secrets path`                 | Show the active local secrets directory.         |
| `./c8run secrets delete <name>`        | Delete one secret.                               |
| `./c8run secrets delete --all`         | Delete all local secrets after confirmation.     |
| `./c8run secrets import [dotenv-file]` | Import `KEY=value` entries from a dotenv file.   |
| `./c8run secrets import -`             | Import dotenv entries from standard input.       |

The commands have the following current safety boundaries:

- Import immediately replaces values with matching names. The cache warning appears after the values are written, without advance confirmation.
- Both `delete <name>` and `delete --all` prompt for confirmation. In noninteractive use, add `--yes`.
- Secret names can contain dashes, but names beginning with `-` can't currently be passed to `set` or `delete <name>`.

For example, import a local dotenv file:

```bash
./c8run secrets import .env.secrets
```

Use a dedicated dotenv file for secret values. `c8run secrets` refuses to import the c8run `.env` file because it can contain runtime, download, and packaging credentials.

Configure local secret management with the following environment variables. Set them in your environment or the c8run `.env` file before running secret commands or starting Camunda 8 Run.

| Variable                  | Default                     | Valid values                                                              | Behavior                                                                                                                                                 |
| ------------------------- | --------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `C8RUN_SECRETS_MODE`      | `local`                     | `local` or `external`                                                     | In `local` mode, c8run configures its file store. Set `external` whenever you configure another store. Local `c8run secrets` commands are then disabled. |
| `C8RUN_SECRETS_DIR`       | Platform-specific directory | An absolute or relative directory path                                    | Sets the file-store path for local secret commands and startup. Relative paths resolve from the current working directory.                               |
| `C8RUN_SECRETS_CACHE_TTL` | `20m`                       | A duration expressed as a whole number of minutes, with a minimum of `1m` | Sets how long Camunda caches resolved secret values.                                                                                                     |

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/configuration
