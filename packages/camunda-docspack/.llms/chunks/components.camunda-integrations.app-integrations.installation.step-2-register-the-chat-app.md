# Install app integrations — Step 2: Register the chat app

Complete only the tabs for the platforms you are registering. Registering Microsoft Teams does not require Slack, and registering Slack does not require Microsoft Teams.

Both platforms are set up with `@camunda/app-integration-cli`, version 2, which provides two binaries: `c8-teams` and `c8-slack`. You run only the binary for the platform you are registering. Both share the same commands: `create`, `build`, `deploy`, `show-config`, and `migrate`.

**Note**
The superseded v1 package, `@camunda/teams-app-integration-cli`, still exists as a deprecated alias with the `c8teams` binary. A project created with v1 migrates automatically on first load with the v2 CLI, and `migrate` runs that migration explicitly.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation
