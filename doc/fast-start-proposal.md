# Fast Start — from an idea to a running process on Camunda SaaS in ten minutes

> **Goal:** a user picks a template or describes a process, runs it locally step by step on
> real data, runs one command, and it runs on Camunda 8 SaaS with a working trigger.
>
> Benchmark: n8n. It is not an enterprise product, but its first hour is the best in workflow
> automation. This document says why, what Camunda lacks for that first hour, and how BPMN Kit
> closes the gap without leaving Camunda.

---

## 1. Why n8n works so well in the first hour

| What n8n does | Why it matters |
|---|---|
| **Every workflow starts with a trigger.** A webhook, schedule, app event or chat node is the first node. Its URL is shown at once, and "Listen for test event" captures a real request. | The question "how does this start?" never comes up. |
| **"Execute step" on any node.** You see its output at once as a table, as JSON or as a schema. You can pin data, so later steps run again without calling the API again. | You build from the data forward, not from the model forward. Each step is checked before you add the next one. |
| **Drag a field from the output of the previous step into an input.** n8n writes the expression. | Nobody writes a mapping by hand against a schema they cannot see. |
| **Credentials are set up in the node.** You click "Connect" for OAuth, test it, and use it again later. | You do not go to a separate admin console. |
| **About 500 integration nodes, an HTTP node that imports cURL, and an inline Code node.** | Custom code runs where you write it. You do not deploy a separate service. |
| **One process has the editor, the engine, the workers and the webhook receiver.** The "Active" toggle is the deploy. | You make no infrastructure decisions on the first day. |
| **About 10,000 templates that you import with one click**, an AI agent node and a chat trigger. | You start from something that works, not from an empty canvas. |
| **The executions list keeps the data of each node.** "Debug in editor" loads a past run into the canvas. | A failure is one step from its fix. |

n8n gives up formal semantics for this: loose data, weak error and compensation handling, and
limits at scale and in governance. That trade is why it is not enterprise, and also why its
first hour feels so good.

## 2. What Camunda 8 SaaS lacks for the first hour

Camunda has improved. Hub has a **Test mode** that runs a segment of a process with prefilled
start data. Test mode helps once a process runs. The friction comes before that:

1. **Too many places to visit.** You go to Hub/Modeler, then to cluster management, API clients
   and the Cluster secrets tab. Then you go to Operate and Tasklist to see the result. n8n is
   one screen.
2. **Credentials come up during deploy.** The deploy dialog warns about missing client
   credentials when a process has a service task, a message or a signal. The fix is somewhere
   else.
3. **Secrets are managed somewhere else.** You write `camunda.secrets.X` in the model and create
   its value on another tab. A missing value shows only at runtime, as a secret-resolution
   incident.
4. **Custom code needs a worker that you host.** A service task that is not a connector needs a
   Java or Node worker that runs somewhere with credentials. This is the largest difference from
   the n8n Code node.
5. **The trigger is not where you start.** The default start event is blank. A webhook start
   event shows its URL only after deploy, and you cannot capture a test request.
6. **You write the data mapping in FEEL by hand.** You write input and output mappings with no
   sample data and no schema of the previous step.
7. **You must learn BPMN concepts before you see a result.** Tokens, gateways and correlation
   keys are powerful, but a beginner must understand them before anything runs.
8. **Templates and blueprints are pages to read.** You cannot run one in one click.

## 3. Where BPMN Kit is today

What BPMN Kit already has:

- **Build:**
  - AI drafts processes and fills in the 133 Camunda connector templates, with
    `{{secrets.…}}` placeholders.
  - `casen synth --check` dry-runs a process with every outside call mocked. Studio has
    "Try it".
- **Run locally:**
  - Local engines (TypeScript and WASM, Reebe).
  - `casen dev`.
  - Live mode with token overlays.
- **Deploy and watch:**
  - The Studio deploy pane and Operate views.
  - About 25 templates (`casen template use`).
  - Proxy triggers for webhooks, timers and file watches.
- **Camunda SaaS:**
  - `casen profile import` reads the Hub credentials file.
  - The generated `casen clusters create-secret`.

The path that existed did not run on SaaS. Phase 0 below fixes it.

Gaps that remain:

- **Login:** no browser login; you paste a client ID and secret.
- **Secrets:** nothing checks that the secrets of a diagram exist on the cluster.
- **Webhooks:** webhook URLs are `localhost` only, with no tunnel.
- **Run data:** you see the input and output of each step only for jobs that the proxy's own
  worker ran.
- **Templates:** Studio's template gallery has its own 5 templates, apart from the 25 in
  `packages/patterns`.

## 4. Proposal

BPMN Kit owns the first hour: the local engine, step runs and checks before deploy. Camunda
SaaS stays the production runtime. This matches the "complement to Camunda" position in
[market-analysis.md](market-analysis.md). It is not a race with n8n for the number of
integrations.

### Phase 0 — make the path that exists work ✅ (2026-10-09)

- [x] **`/v2` was doubled.** Profiles store the base URL with `/v2`, but the CLI deploy, the
  proxy worker daemon, its triggers, the MCP deploy, run history and the VS Code deploy added
  `/v2` again. Every one of those requests to SaaS went to `/v2/v2/…`. `clusterApiUrl()` in
  `@bpmnkit/profiles` now joins the URL for all of them.
- [x] **`casen resource create-deployment` sent no file.** The API generator read only JSON
  request bodies, so every multipart operation (deployments, documents) had no body. These
  operations now take `FormData`, and the CLI commands take file arguments.
- [x] **Search queries had no `filter` or `sort`, and results had no `items`.** The generator
  dropped the properties that a schema adds to its `allOf` members.
- [x] **The guides used APIs that do not exist.** The quick start, the deployment guide and the
  `@bpmnkit/api` page called `client.process.deploy` and `client.process.startInstance` and
  used the Console API URL. They now use the real API, and every snippet type-checks. They also
  show the CLI path:
  `casen profile import` → `casen deploy deploy --target camunda8` →
  `casen process-instance create`.
- [x] **The READMEs and the CLI page listed commands that do not exist**: `casen profile add`,
  `casen deploy <file>` and `casen instances list`. They now list the real ones.

### Phase 1 — `npm create bpmnkit` / `casen new`

- [ ] Pick a template from one gallery (the patterns and Studio's templates together), or
  describe the process and let the AI draft it.
- [ ] The scaffold has:
  - the `.bpmn` file;
  - `workers/`, with TypeScript stubs for each custom job type, made from the diagram with
    `@bpmnkit/flow` or `@bpmnkit/worker-client`;
  - `.env.example`, with the secrets that `listSecrets()` finds;
  - sample start data.
- [ ] `casen dev` opens Studio on the project with the local engine.

### Phase 2 — build by running, as in n8n, on the local engine

- [ ] **Run one step.** "Run this step" runs one element on captured or pinned input. A data
  panel shows its output as a table, as JSON or as a schema, and keeps it per element. Run
  history already keeps input and output for the jobs the proxy runs. Extend it to every
  element the local engine runs.
- [ ] **Map data by dragging.** Drag a field from the output of the previous step into an input
  mapping, and Studio writes the FEEL. The FEEL parser and the variable-flow analysis planned in
  [builder-experience.md](builder-experience.md) give the schema and catch typos.
- [ ] **Start with the trigger.** A new diagram asks how it starts: webhook, timer, form, message
  or manual. For a webhook, an opt-in tunnel (cloudflared) lets a real outside service call the
  local run. Its request becomes test data.
- [ ] **Inline code.** A "Code" task has its body written in Studio and becomes
  `workers/<type>.ts`. This answers "write and host a worker".

### Phase 3 — `casen ship`: one command from local to SaaS

1. [ ] **Login.** `casen login` opens the browser on the page that creates an API client, then
   imports the credentials from the clipboard or a file. A true device flow is possible only if
   Camunda offers one. Check that first instead of promising it.
2. [ ] **Checks before deploy.** One checklist, before anything is sent:
   - `casen lint` against the Camunda version of the cluster;
   - the `synth --check` dry run;
   - for each `{{secrets.X}}`, check that it exists on the cluster (`clusters get-secrets`).
     Offer to push it from `.env`, with confirmation, and never print the values. Rewrite the
     references to `camunda.secrets.X` where the cluster version wants that form;
   - check that client credentials exist when the process needs them.
3. [ ] **Deploy** the BPMN, its DMN tables and its forms as one deployment.
4. [ ] **Workers.** Run custom job types against SaaS from the developer's machine
   (`casen worker start --profile saas`). Later, generate a deploy target: a Dockerfile, or a
   Fly or Cloud Run snippet.
5. [ ] **Smoke run.** Start one instance with the pinned sample data and follow it to
   completion or to an incident. Print the SaaS webhook URL for a webhook start event, or the
   Tasklist link for a form start.
6. [ ] **Live link.** Open the result in Studio's Operate view on the SaaS profile, with the
   incident highlighted if there is one. AI incident assist is already there.

When it is done, one command ends like this:

```
✓ deployed v3 · ✓ 2 secrets present · ✓ worker "enrich-lead" connected · ✓ test instance completed in 4.2s · webhook: https://…
```

### Phase 4 — polish that adds up

- [ ] A template page on bpmnkit.com, with "Open in Studio" and "Ship to my cluster".
- [ ] Drop → "Run it": the AI draft and connectors from Drop become a project with
  `casen new --from-drop <id>`.
- [ ] "Debug in editor" for SaaS runs: load the variables of an Operate instance as pinned data
  for a local run.

## 5. Order and measures

| Order | Work | Measure |
|---|---|---|
| 1 | Phase 0 | No broken step in the guides. ✅ |
| 2 | `casen ship`, with the checks before deploy and the smoke run | It fixes the largest SaaS pain: credentials, secrets, "did it run?". |
| 3 | The scaffold and one template gallery | — |
| 4 | Step runs, the data panel and drag mapping | The largest work; this is the n8n feeling itself. |

The main measure is the median time from `npm create bpmnkit` to the first completed instance
on SaaS. A scripted end-to-end test on a trial cluster measures it.

## 6. Found while fixing Phase 0, not fixed yet

- `getProcessDefinitionXML` and the other XML endpoints are typed `Promise<void>`. The generator
  reads only `application/json` responses.
- The proxy triggers start timers on the active profile. When that profile is SaaS, they can
  start an instance a second time, after SaaS's own timer has already started one.
- The `as AnyQuery` casts in `apps/proxy/src/index.ts` are not needed now that search queries
  have their `filter` type.
