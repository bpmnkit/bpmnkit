# Intrinsic functions — Available functions — `createGithubAppInstallationToken`

The `createGithubAppInstallationToken` function generates a GitHub App installation access token. This is useful when you need to authenticate as a GitHub App installation to access GitHub APIs.

The function accepts three required parameters and one optional parameter:

- `privateKey`: The RSA private key of your GitHub App (PEM format). Store this value as a secret.
- `appId`: The app ID of your GitHub App.
- `installationId`: The installation ID of your GitHub App. See [GitHub's documentation](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation#generating-an-installation-access-token) for instructions on how to find your installation ID.
- `githubApiBaseUrl` (optional): The base URL of a GitHub Enterprise Server or Cloud host to target instead of the public GitHub API. Omit this parameter, or pass `null`, to use the public GitHub API (`https://api.github.com`).

```json
{
  "camunda.function.type": "createGithubAppInstallationToken",
  "params": ["{{secrets.GITHUB_APP_PRIVATE_KEY}}", "12345", "67890"]
}
```

The function returns the installation access token as a string. You can use this token to authenticate GitHub API requests.

#### Custom GitHub API base URL (GitHub Enterprise)

To target a GitHub Enterprise Server or Cloud host, pass its base URL as the fourth parameter:

```json
{
  "camunda.function.type": "createGithubAppInstallationToken",
  "params": [
    "{{secrets.GITHUB_APP_PRIVATE_KEY}}",
    "12345",
    "67890",
    "https://github.example.com/api/v3"
  ]
}
```

The resolved base URL must be allow-listed on the connector runtime before use:

- By default, with no configuration, only the public GitHub API is allowed.
- To permit one or more GitHub Enterprise hosts, set the `CAMUNDA_CONNECTOR_GITHUB_APP_ALLOWED_BASE_URLS` environment variable on the connector runtime to a comma-separated list of allowed base URLs:

  ```bash
  CAMUNDA_CONNECTOR_GITHUB_APP_ALLOWED_BASE_URLS=https://github.example.com/api/v3,https://github-other.example.com/api/v3
  ```

- Setting this variable replaces the default allow-list entirely. The public GitHub API is not implicitly included; add `https://api.github.com` explicitly if you need both.
- A call that resolves to a base URL that isn't allow-listed fails with an error rather than falling back silently, so a misconfigured or unexpected base URL is caught rather than masked.

---
Source: https://docs.camunda.io/docs/next/components/connectors/advanced-topics/intrinsic-functions
