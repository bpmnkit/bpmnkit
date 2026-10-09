# CSAP c8ctl plugin — Usage

The plugin provides a `csap-setup` command to prepare one of Camunda's SAP integration modules for deployment. You can run the command interactively or provide all required options as command-line flags.

### Authentication token

Under the hood, the plugin uses the GitHub API to query for releases. The [GitHub API has a rate limit](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) for unauthenticated requests. It is thus advisable to provide a GitHub access token to the environment you run the plugin in.

#### Local use

A personal GitHub access token can be obtained in multiple ways. Either [statically by generating one](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) or dynamically by using the `gh` CLI to log in (`gh auth login`), which in turn produces an access token.

Then, inject the token into your (shell) environment as the variable `GH_TOKEN`. The plugin automatically picks up the token from `GH_TOKEN` and uses it for subsequent requests.

Windows (Command Prompt)

```shell
for /f "delims=" %i in ('gh auth token') do set GH_TOKEN=%i
```

Windows (PowerShell)

```shell
$env:GH_TOKEN = (gh auth token)
```

Linux/macOS (bash)

```shell
export GH_TOKEN=$(gh auth token)
```

#### CI/CD use

If your CI/CD environment isn't GitHub, you must obtain a GitHub access token, as with [local use](#local-use), to authenticate the plugin's requests to the GitHub API.

For GitHub Actions, all runs are provided a `GITHUB_TOKEN` automatically. Declare it for the respective run of `c8ctl csap-setup` with the `env` YAML declaration:

```yaml
jobs:
  your-job:
  # ...
  steps:
    - run: |
        c8ctl csap-setup --for #...
      env:
        GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Interactive mode

Run the following command to start the interactive setup:

```bash
c8ctl csap-setup
```

The plugin guides you through prompts to collect all required inputs, including the SAP integration module, Camunda version, deployment method, and credentials.

### Command-line options

All prompts are also available as command-line flags, allowing you to automate the setup process.

#### Command syntax

```bash
c8ctl csap-setup [options]
```

#### Options

| Option           | Type   | Description                                                                                              | Default value                |
| ---------------- | ------ | -------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `--for`          | string | Specifies the SAP integration module to set up. Choices: `odata`, `rfc`, `all`.                          | (Prompted if not provided)   |
| `--camunda`      | string | Specifies the Camunda version. Choices: `8.10`, `8.9`, `8.8`, `8.7`, `8.6` (deprecated).                 | (Prompted if not provided)   |
| `--deployment`   | string | Specifies the Camunda deployment option. Choices: `SaaS`. (`SM` for self-managed is currently disabled.) | (Prompted if not provided)   |
| `--clusterId`    | string | Specifies the Camunda cluster ID.                                                                        | (Prompted if not provided)   |
| `--region`       | string | Specifies the Camunda cluster region, for example, `bru-2`.                                              | (Prompted if not provided)   |
| `--clientId`     | string | Specifies the Camunda API client OAuth2 client ID.                                                       | (Prompted if not provided)   |
| `--clientSecret` | string | Specifies the Camunda API client OAuth2 client secret.                                                   | (Prompted if not provided)   |
| `--to`           | string | Target directory for setup artifacts.                                                                    | OS-dependent `tmp` directory |

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/csap-cli
