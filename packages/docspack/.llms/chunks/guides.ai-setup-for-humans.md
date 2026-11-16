# AI setup — for humans

Goal: your coding agent writes a short text spec, runs `casen build`, and gets a laid-out,
linted, deployable `.bpmn` (plus a form per user task). Setup is five copy-paste steps.
Writing for the agent itself? See [AI setup — for agents](/docs/guides/ai-setup-for-agents).


## Set up

```sh
# 1. The CLI
npm install -g @bpmnkit/cli          # or: npm i -D @bpmnkit/cli, then npx casen …

# 2. Claude Code plugin (skills such as /bpmnkit:bpmn-script, /bpmnkit:deploy)
#    run inside Claude Code:
/plugin marketplace add bpmnkit/bpmnkit
/plugin install bpmnkit@bpmnkit

# 3. No plugin? Install the lightweight slash commands into .claude/commands/ instead
casen skills install

# 4. Offline docs for the agent (BPMN Kit + Camunda 8), no network, no server
npm i -D @bpmnkit/docspack @bpmnkit/camunda-docspack
```

- **AGENTS.md** — add a line telling any agent where to look. Copy this:

  ```md
  BPMN/DMN/forms: run `casen agent-card bpmn` once, write a spec, run `casen build <spec> --deploy`.
  Docs: `npx bpmnkit-docs ask "<question>"` (add `--pack @bpmnkit/camunda-docspack` for Camunda).
  ```

- **Camunda credentials (only for `--deploy` to a cluster)** — export them in the shell that
  starts the agent. Without them `--deploy` goes to a local Reebe engine (`casen reebe start`).

  ```sh
  export ZEEBE_REST_ADDRESS=https://<region>.zeebe.camunda.io/<cluster-id>
  export CAMUNDA_CLIENT_ID=… CAMUNDA_CLIENT_SECRET=… CAMUNDA_OAUTH_URL=…
  # self-managed with basic auth: CAMUNDA_BASIC_AUTH_USERNAME / CAMUNDA_BASIC_AUTH_PASSWORD
  ```

  Or save a profile once with `casen profile create`; `--target auto` (the default) tries the
  environment, then the profile, then local Reebe. Never commit these values.

Check it works: `casen agent-card bpmn | head` prints the cheat sheet.

---
Source: https://bpmnkit.com/docs/guides/ai-setup-for-humans
