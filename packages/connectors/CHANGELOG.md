# @bpmnkit/connectors

## 1.3.0

### Minor Changes

- ba14aa5: API cards: real endpoints of HTTP APIs for the REST connector, from an offline index.
  - **`@bpmnkit/connector-gen/api-index`**: the base URL, authentication and endpoints of 78 HTTP APIs (20,327 operations), built from the catalog's OpenAPI specs by `scripts/build-api-index.mjs`. It is one lazily loaded module per service (`API_SERVICES`, `loadApiService`, `loadApiServices`). Specs that state a non-permissive license are left out. Notion's catalog spec URL is fixed.
  - **`@bpmnkit/core/connectors`** (re-exported by `@bpmnkit/connectors`):
    - `selectConnectors(…, { apis })` offers the REST connector with an **API card** — the service's best-fitting endpoints — for a task that names a system without a dedicated connector, or one whose connector lacks the operation.
    - On an `http` line, `api=<service>` or a URL under the service's base URL gets the base URL, `{param}`s as FEEL, authentication with a secret placeholder, and required headers (`applyConnectorLines(…, { apis })`). A call the index lacks becomes a question.
    - New exports: `apiServicesIn`, `findApiOperations`, `rankApiOperations`, `findApiOperation`, `formatApiCard`, `formatApiOperation`, `apiUrl`, `apiAuthValues`, `apiSecretNames`, `apiBrand` and the `ApiService` types.
  - **`@bpmnkit/cli`**: `casen connector api "<request>"` prints the endpoints of the API a request names.
  - **`@bpmnkit/drop`**: the connect pass loads the services a request names and shows their endpoints to the model. `bench:generate` scores `mustCallUrls`, with new Notion and GitHub-workflow-runs golden prompts.

- ba14aa5: The connect pass: generated and shared diagrams get their Camunda connectors configured.
  - **`@bpmnkit/core/connectors`** (re-exported by `@bpmnkit/connectors`): `selectConnectors({ text, tasks })` picks the connector cards for each task of a diagram, in code. A card qualifies when the task's name names the system, when the request names it and no other task does, or when the task's name shares a word with the connector's name. REST is the fallback for HTTP-call tasks. A task with no candidate is left out. `formatConnectorSelection` writes the picked cards as a prompt block. `applyConnectorLines` now changes only the inputs a line names when the element already carries the same connector.
  - **`@bpmnkit/drop`**: `POST /drop/api/connect`, on when `AI_CONNECT_MODEL` is set.
    - It picks the cards, asks the model for `with` lines only, and applies them on the server; with nothing to connect it is skipped without a model call.
    - The "Describe a process" generator runs it after every draft and change. Required inputs it left out become questions answered with one line, applied without a model.
    - Shared diagrams get **Add connectors** while editing, as one undoable change.
    - The first-draft prompt asks for one service task per outside system.
    - `bench:generate --connect` scores the connected diagrams. Ten connector golden prompts are added, and a crash at the end of golden-prompt runs is fixed.

- ba14aa5: Connector cards: one connector operation with only the inputs it uses, for a model's prompt.
  - **New functions.** `findConnectorCards(query)`, `connectorCards(id)`, `listConnectorCards()` and `formatConnectorCard(card)` are in `@bpmnkit/core/connectors`, re-exported by `@bpmnkit/connectors`. A card carries the operation's required and optional inputs (secrets and FEEL marked), the `values` that select it, and its modes (an authentication type, say), each with the inputs it adds. Plumbing such as retries, timeouts and TLS is marked `advanced`.
  - **Aliases.** `CONNECTOR_ALIASES` gives every bundled template a short, fixed alias (`http`, `slack`, `sqs-message-start`, …) and lists the dropdowns that choose its operation. Use `connectorAlias(id)` and `templateIdForAlias(alias)` to map between them.
  - **CLI.** `casen connector cards "<request>"` prints the best cards; `-o json` prints them as data.
  - **Fix: a hidden dropdown's default no longer switches inputs on.** Applying a template used every property's default when evaluating conditions, including dropdowns hidden by their own condition. Applying GitHub's "create issue" therefore reported 11 missing required inputs belonging to other operations and wrote ten `url` and ten `method` inputs. Only active properties count now, as in the Modeler.

- ba14aa5: The connector templates are refreshed from the Camunda marketplace: 133 templates, each at its newest version.
  - **Newest versions, not oldest.** The update script used to take the last entry of each template's version list, which the registry orders newest first, so every template was bundled at its oldest version (the HTTP connector at 1 instead of 18). It now takes the highest version. `Bpmn.restConnector()` stamps `zeebe:modelerTemplateVersion` `18` to match.
  - **20 new templates**, among them AI Agent Task and AI Agent Sub-process v2, the MCP start event, Databricks, App Integrations, AWS Bedrock AgentCore, and O365 email inbound events. The three IDP extraction templates are no longer in the registry and are gone.
  - **`zeebe:agentDefinition`** (Camunda 8.10) is a supported binding. It is applied by `applyConnectorTemplate`, `applyElementTemplate` and `applyTemplateToElement`. `ServiceTaskOptions` and `AdHocSubProcessOptions` take `agentDefinition: { agentType }`, `ZeebeExtensions` has `agentDefinition`, and `getZeebeExtensions()` reads it.
  - **`Configuration` properties** (Camunda 8.10 reusable connection credentials) validate. They bind like any input, and `TemplateProperty.configurationTemplate` names the credential kind.
  - **Renamed input keys.** Newer inbound templates give their properties explicit ids, so their input keys changed, e.g. `message.correlationKey` → `correlationKeyProcess`, `correlationKeyExpression` → `correlationKeyPayload`, `message.name` → `messageNameUuid`. The bindings are unchanged.

- ba14aa5: `with` lines: a language model configures Camunda connectors in the line format.

  ```
  with notify: slack chat.postMessage | token={{secrets.SLACK_TOKEN}} | data.channel=#ops | data.text== "Order " + orderId
  with fetch: http GET https://api.example.com/orders | result=order: response.body
  ```

  - **`@bpmnkit/core`** parses them, without the catalog. `parseProcessText` returns `connectors`, each with the element it names. `parseProcessDelta` returns `connectors` too. `parseConnectorLine` is exported. `writeProcessText(defs, { connectorLine })` writes an element's connector back as a `with` line.
  - **`@bpmnkit/core/connectors`** resolves and applies them, re-exported by `@bpmnkit/connectors`:
    - `applyConnectorLines(definitions, lines)` applies each line through `applyTemplateToElement`. A plain task becomes the connector's service task, and inbound templates work on events.
    - `resolveConnectorLine` repairs a near-miss alias, an operation given by its last dotted part or by the input that selects it, a short key, and `http POST <url>` written without keys. It turns `result=name[: expr]` into the right result header, and a credential written as a value into a `{{secrets.…}}` placeholder.
    - A required input left out becomes a question with a line to finish.
    - `connectorLineFor(element)` writes an element back as a line, and `CONNECT_GUIDE` is the connect pass's system prompt.
  - **`@bpmnkit/editor`'s `applyProcessDelta`** applies a script's `with` lines when given `applyConnectors: applyConnectorLines`, and returns `questions`.
  - **Fix:** template conditions of the form `isEmpty` (Camunda 8.10 templates with a saved-credential picker) are evaluated. They used to count as always true, in the applier and in the editor's property panel, so the URL input of the HTTP connector was active twice.

- ba14aa5: The connector catalog moved into core as `@bpmnkit/core/connectors`: `listConnectors`, `searchConnectors`, `getTemplate`, `applyConnectorTemplate`, `applyElementTemplate`, `applyTemplateToElement`, `validateElementTemplate` and the template types, with the Camunda 8 out-of-the-box templates as `BUNDLED_CONNECTOR_TEMPLATES`. It is a separate entry, so `@bpmnkit/core` itself does not grow.

  Core's templates leave out icons, groups, tooltips and placeholders, which only a property panel draws. `@bpmnkit/connectors` keeps its API and re-exports core's, storing only those parts and putting the full templates back together: `getTemplate`, `applyConnectorTemplate` and `CAMUNDA_CONNECTOR_TEMPLATES` still answer with full templates, icons included. It no longer depends on `@bpmnkit/feel`, and a bundle that imports it is slightly smaller than before, since the catalog is not shipped twice.

  `pnpm update-connectors` writes both halves from one fetch, writes nothing when the registry is unchanged, and runs weekly in `.github/workflows/connector-templates.yml`, which opens a pull request.

### Patch Changes

- ba14aa5: Connect pass fixes from its first real benchmark.
  - **Card selection** (`selectConnectors`):
    - A connector the request names is no longer crowded out by another connector's operations, so SendGrid shows up for an email task.
    - A connector naming a system nobody asked for ranks lower (Azure OpenAI for "OpenAI").
    - Deprecated templates are no longer offered.
    - A task that names only an API ("Call Stripe REST API") gets endpoints that match the request.
    - A REST call the request asks for reaches the task it is for.
  - **The `with`-line resolver** now repairs:
    - a line copied from an API card's head;
    - `{{variable}}` and `${variable}` written instead of FEEL;
    - a `{{param}}` in a path;
    - a path written without `api=`.

    A short alias no longer matches another connector two letters away.

  - **Drop:**
    - A line is matched to its node by id in any case. If the id names no node, or a node no card was offered for, the line goes to the task its connector fits; with several, to the one whose name shares the line's words.
    - A second line for a node is reported.
    - A line missing its `with` is kept.
  - **More resolver repairs:** a line starting with an HTTP method is read as a REST call, and `==#channel` is read as the text it is.
  - **Drop, degenerate answers:** an answer of nothing but `!` (gpt-oss-120b's token 0, about 1 draft in 20 in the benchmarks) is given up on before it reaches the reader. The fallback model answers instead, or the reader is told to try again.
  - **More near misses repaired:** a line naming its node by label, a line without the colon after its id, headers written as text, and a system named in the singular ("Google Sheet").
  - **From the fourth benchmark:** a service of the API index written as the alias (`stripe POST /v1/refunds`) is read as a REST call to it. Several inputs in one `|` part (`region=… functionName=…`) are split, and a `*` copied from a card is dropped. In Drop, a line naming a flow (`start > summarize:`) is read as one for its last node, and a line that copied the node's kind (`service Run AWS Lambda …`) gets the node's first card.
  - **Drafting repairs:** `parseProcessText` reads an id written with spaces before its bracket (`call back[…]`) as one id, and makes a catch event named for a call it makes ("Send to SQS") a service task. `selectConnectors` ranks the request's system first on a task that names one the request does not ("Post summary to Slack" when the request says Teams). Drop's drafting prompt asks for the system the description names.
  - **From the fifth benchmark:** a bracket left open is closed where the name ends, and an id declared again after an arrow with a name of several words is a new node. `selectConnectors` leaves out an API card when the dedicated connector covers the request as well as the index does, and leaves out connectors that only share a word with a task that names its system. In Drop, `with` lines run together on one line are split.
  - **From the sixth benchmark:** the resolver reads an SDK call (`chat.completions.create`) as the operation it starts with, and keeps the path an `api=` line completes over a FEEL `url=`. `isConnectorAlias` is exported. In Drop, a line with the node's id in the alias's place, a copied `[declaration]`, a label before the alias, a flow with free text, or an alias no connector has is repaired, and a misplaced line may take a task from a line whose connector is not offered there.
  - **From the seventh and eighth benchmarks:** `parseProcessText` reads numbers as ids (`n1`), a line starting with an arrow as continuing the path above, and a space before an arrow's label. `selectConnectors` gives a service only the request names to no task that names another system. The resolver spells an API path's words as the service does, reads `${x}` inside FEEL as `x`, and reads an operation the connector lacks as the one sharing the longest start with it. Drop splits a flow of connector steps written on one line, and drops the connect guide's example lines when a model copies them.
  - **Bench:** a golden prompt's `mustContainTaskTypes` entry may list alternatives. Prompt 10 accepts SendGrid or the Email connector, and prompt 20 the OpenAI or the AI Agent connector.
  - **From the ninth benchmark:** `parseProcessText` reads a kind and a name without brackets after an arrow as a declaration. `selectConnectors` no longer makes a connector a candidate by a generic word alone (request, document, file, data, report, record, form). In Drop, a `with` line naming no connector gets the node's first card.
  - **API ranking:** `rankApiOperations` no longer counts the parts of a service's name ("git" and "hub" of GitHub) and weighs a word most of a service's operations share down, so "List failed GitHub Actions runs" ranks the workflow runs endpoint first. `selectConnectors` lets a dedicated connector's operation cover a task only when its verb and resource fit, and compares the same words in its request check. Drop's drafting prompt asks for tasks named in the description's own words.
  - **From the tenth benchmark:** the resolver reads an API card's summary written where the path goes as that operation. In Drop, an unknown alias read as a REST first card keeps the line's method and path, with the task's API.
  - **Drafting:** the line format gains `each=<list>` (a multi-instance task or sub-process) and `after=<duration>` (a timer's duration; also read from a timer's name), carried by `CompactElement.multiInstance` and `CompactElement.timerDuration`. An attribute written before the bar is read. The guide's example shows a parallel split, `each=` and a timer boundary. Drop's drafting prompt gives a REST call an error boundary.
  - **Drafting, after the bench:** the guide's example is its original four lines again, as glm copied example lines into unrelated processes; parallel work, deadlines and `each=` are taught as rules. A pass-through `and`/`or` node named like a step becomes a task, and pass-through gateways left by a removal are removed too.
  - **Drafting repairs:** a step named for each or every item ("Send email to each stakeholder") is multi-instance over the list, and a DMN decision's unlabelled outcomes split with an xor instead of running in parallel. Drop reads a diagram line copied before the colon as a `with` line, and keeps a copied guide example where its connector was offered.
  - **More drafting repairs:** `after=` on an event that is not a timer makes it one, ISO durations are read in lower case, and a boundary without `on=` that one task is drawn into goes on that task.
  - **Drop checks each draft against its request:** when the request names a DMN decision, a time limit, a failure or REST call to handle, parallel work, a step per list item, a person's work or a message to wait for that the draft has no element for, one change request asks for exactly that, and its answer is kept only when it fills a gap without losing an element. `bench:generate` runs the same check (`--no-check` to leave it out).
  - **Drafting repairs from the draft check:** steps in a row between two `and` nodes run in parallel, a catch event with `on=` a task is a boundary event (and the arrow from that task into it is dropped), and a named gateway with `each=` is a task run per item. `bench:rescore` re-evaluates completions the check dropped.
  - **From the five-run bench:** a URL written where a `with` line's alias goes is a REST call to it, and a method after the service in `api=` (`api=github GET`) is the call's method.

- Updated dependencies [ba14aa5]
- Updated dependencies [ba14aa5]
- Updated dependencies [ba14aa5]
- Updated dependencies [ba14aa5]
- Updated dependencies [ba14aa5]
- Updated dependencies [ba14aa5]
- Updated dependencies [ba14aa5]
- Updated dependencies [ba14aa5]
- Updated dependencies [ba14aa5]
  - @bpmnkit/core@1.3.0

## 1.2.0

### Minor Changes

- 461287b: New template: **Cloudflare Clef Decision** (`io.bpmnkit.connectors.CloudflareClef.v1`). It asks a Clef decision model typed yes/no, choice and score questions and returns calibrated answers that a gateway can route on. It runs on Camunda's REST connector, so no extra job worker is needed. It is the first template this repo maintains itself: `BPMNKIT_CONNECTOR_TEMPLATES` holds such templates beside the generated `CAMUNDA_CONNECTOR_TEMPLATES`, and `listConnectors`, `searchConnectors` and `getTemplate` include them. `ElementTemplate` gains the schema's optional `category`.

### Patch Changes

- 461287b: `validateElementTemplate` rejects `feel: "static"` on a property that is not `Number` or `Boolean`, as Camunda's element-template schema does — Camunda Modeler refuses the whole template over it. The Cloudflare Clef Decision template's timeouts are now `Number` fields with `=20`, like Camunda's REST connector, so the template loads in Modeler.

## 1.1.0

### Minor Changes

- 56ad670: Apply inbound-connector and linked-resource element templates.
  - `applyTemplateToElement(definitions, elementId, template, values)` writes a template onto an
    element of a parsed model: the root `bpmn:message` an event or receive task references
    (created, reused by name, or renamed in place), that message's `zeebe:subscription`
    correlation key, `zeebe:properties` (`inbound.type` and the rest), `zeebe:linkedResources`,
    the element type and message event definition `elementType` asks for, and the
    `zeebe:modelerTemplate` stamps. Deterministic and idempotent; the input is never mutated. A
    generated message name is derived from the template and element ids.
  - `applyElementTemplate` now returns `messageName` / `correlationKey` on inbound intermediate and
    boundary results (and `messageName` on start events), and reports — rather than drops — the
    bindings builder options cannot carry.
  - `propertyKey` gives these properties keys: `message.name`, `message.correlationKey`,
    `linkedResource.<linkName>.<property>`.
  - `validateElementTemplate` no longer warns about `bpmn:Message#property`,
    `bpmn:Message#zeebe:subscription#property` or `zeebe:linkedResource`; it warns about an
    `elementType.eventDefinition` other than `bpmn:MessageEventDefinition` instead.
  - A condition comparing a Boolean property against `true`/`false` now matches.

### Patch Changes

- 56ad670: Each README now shows the package's product tier (Core, Tools or Experimental) and what that tier promises. The `@bpmnkit/reebe-wasm` README and description say that Reebe is a dev/test engine, not for production: a clean-room implementation of the Zeebe API, not affiliated with Camunda.
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
- Updated dependencies [56ad670]
  - @bpmnkit/core@1.1.0
  - @bpmnkit/feel@1.1.0

## 1.0.0

### Major Changes

- 0ba6ef6: **1.0.0.** These twelve packages now carry the stability promise at
  https://bpmnkit.com/docs/getting-started/stability.

  A 1.0.0 is not a rewrite, it is a commitment: from here, `^1` means an upgrade will not move
  your code, and anything that would — a removed export, a narrowed return type, a generated
  document whose `semanticHash` shifts for the same input — waits for a 2.0.

  The bar was three things: a test suite that would catch the package's own breakage, a
  documentation page, and an API worth defending for a year. Twelve of the twenty-six published
  packages clear it. The other fourteen stay on 0.x deliberately — most are short of the first
  two conditions, and the rest are worked examples, scaffolders or generated builds with no API
  of their own to freeze. Joining later costs nothing, since 0.x → 1.0 breaks no one, so the bar
  was applied strictly rather than generously.

  Membership is not only prose: it lives in `STABLE` in `scripts/published-packages.mjs`, and
  `check-packages.mjs` enforces both directions — nothing on the list may lack tests or a
  documentation page, and nothing at 1.0.0 or above may be missing from the list. `api-surface.json`
  records every export of every package in the set, and CI fails a pull request that removes or
  renames one without saying so.

  ### Breaking
  - **`@bpmnkit/core`** — `BuildOptions.strict` is removed. It had been a deprecated alias for
    `explicitJoins` since that option was renamed; rename the call and the behaviour is
    identical. Deliberately taken now rather than carried into 1.0, where it would have been
    stuck until a 2.0. (`applyBpmnOperations`' unrelated `strict` option is untouched.)

  ### Fixed
  - **`@bpmnkit/core`** — parse failures now throw `ParseError`, as the package has always
    documented. They threw a bare `Error` at 35 of the 36 throw sites across the BPMN, DMN and
    Form parsers, so the `if (err instanceof ParseError)` branch `errors.ts` tells callers to
    write never ran. Additive: `ParseError extends BpmnSdkError extends Error`, so code that
    caught `Error` is unaffected and the documented check starts working.
  - **`@bpmnkit/feel`** — the README's Quick Start could not run. `evaluate` takes an
    `EvalContext` (`{ vars }`), not a bare object; `highlightFeel` returns an HTML string rather
    than tokens to iterate; `formatFeel` takes a parsed node, not source text; `annotate` returns
    classified tokens, not an AST; and `ParseError` is `{ message, start, end }`. Four of eight
    rows in its API table were wrong.

  ### Added
  - **`@bpmnkit/feel`** — `builtinNames()` and `getBuiltin()` are exported, so an editor can
    enumerate the 88 built-in functions without reaching into `dist/`.
  - Documentation pages for `@bpmnkit/plugins`, `@bpmnkit/feel`, `@bpmnkit/connectors` and
    `@bpmnkit/ascii`, which had none.
  - `engines.node` on every package in the set; only two declared one before.

### Patch Changes

- 0ba6ef6: Depend on sibling packages by caret range instead of an exact version.

  Every internal dependency was `workspace:*`, which publishes as an **exact** pin —
  `@bpmnkit/plugins` depended on `@bpmnkit/core` at exactly `0.4.0`, not `^0.4.0`. In a
  lockstep 0.x that is invisible. It stops being invisible the moment two BPMN Kit
  packages in one dependency tree disagree about which version of a third they want: npm
  and pnpm both satisfy that by installing **two copies**, and a second copy of
  `@bpmnkit/core` is not a duplicate of the first. Class identity, `instanceof`, module-level
  registries and TypeScript's structural-but-nominal-at-the-boundary types all quietly stop
  matching across the seam.

  `workspace:^` publishes `^0.4.0`, so a consumer resolves one copy. The change has to land
  before 1.0.0 rather than with it: widening a published range is itself a change to every
  manifest, and doing it as part of the 1.0 tag would mean the first stable release is also
  the one that moves everyone's dependency graph.

  The private apps in the workspace keep `workspace:*`. They are never published, so the
  range has no consumer to reach.

- Updated dependencies [0ba6ef6]
- Updated dependencies [d910fae]
- Updated dependencies [0ba6ef6]
  - @bpmnkit/core@1.0.0
  - @bpmnkit/feel@1.0.0

## 0.1.6

### Patch Changes

- Updated dependencies [191d4d2]
  - @bpmnkit/core@0.8.0

## 0.1.5

### Patch Changes

- Updated dependencies [c8ceaaa]
  - @bpmnkit/feel@0.1.0
  - @bpmnkit/core@0.7.1

## 0.1.4

### Patch Changes

- Updated dependencies [e096585]
  - @bpmnkit/core@0.7.0

## 0.1.3

### Patch Changes

- Updated dependencies [780e39d]
  - @bpmnkit/core@0.6.0

## 0.1.2

### Patch Changes

- 9d412da: Coordinated release of every published package

  `@bpmnkit/core` carries fixes that have been on `main` since the last release but never
  shipped — `compactify()`/`expand()` keeping `<bpmn:documentation>` through the operations
  API (#150) among them, which is still reported as reproducing because the newest artifact
  on npm predates the fix. Bumping every publishable package releases the workspace as one
  set, so no consumer resolves a core that a sibling package was never built against.

  Nothing here changes behaviour beyond what each package's own changesets describe.

- Updated dependencies [53a9e25]
- Updated dependencies [9d412da]
- Updated dependencies [9d412da]
  - @bpmnkit/core@0.5.0
  - @bpmnkit/feel@0.0.21

## 0.1.1

### Patch Changes

- Updated dependencies [8fdc6d4]
  - @bpmnkit/core@0.4.0

## 0.1.0

### Minor Changes

- 1d2ec66: Element templates by convention — a project's own connectors reach the tools.

  `@bpmnkit/connectors` could parse the Zeebe element-template schema but only ever loaded its
  own generated catalogue, so a team's in-house connectors could not reach the editor at all.
  Now they can:
  - **`@bpmnkit/connectors/node`** — `discoverElementTemplates({ from, root, configFolder })`
    walks up from a diagram to the project root collecting `.camunda/element-templates/*.json`,
    nearest last so a template beside the diagram overrides one at the root, which overrides the
    bundle. `collectElementTemplates({ root })` is the opposite walk, for checking a whole
    project. The filesystem half sits behind its own entry point so the main package stays
    importable in a browser.
  - **`validateElementTemplate` / `readTemplateDocument`** — structural validation with paths
    (`properties[3].binding.type`) rather than a JSON-schema engine's `oneOf` noise. Every
    problem is reported at once, a file that fails is named and skipped rather than silently
    dropped, and one bad template never costs the good ones beside it. A separate `warnings`
    channel flags a binding the schema allows that `applyElementTemplate` does not write yet.
  - **`registerElementTemplates` / `clearRegisteredTemplates`** — merge templates into the
    catalogue, later registration winning on an id collision, so `listConnectors`, `getTemplate`
    and `searchConnectors` see a project's own.
  - **`casen connector validate [path]`** — validates a whole project (scanning downward, so a
    template beside a sub-folder's diagrams is checked too) or a single `.json` file, with
    `--format json` and a non-zero exit for CI. `list`, `search` and `show` now include the
    project's templates, with `--workspace` and `--config-folder`.
  - **`GET /element-templates?root=…`** on the proxy, and `workspaceRoot` / `workspaceTemplates`
    on the connector-catalog plugin — the browser path, where the host supplies templates rather
    than reaching for a filesystem.

  `TemplateBinding` also gains `bpmn:Message#property`,
  `bpmn:Message#zeebe:subscription#property` and `zeebe:linkedResource`. The bundled catalogue
  uses all three across 98 properties; the union did not admit them, and `applyElementTemplate`
  still does not write them — which is now what the new warning says out loud.

### Patch Changes

- Updated dependencies [1d2ec66]
- Updated dependencies [1d2ec66]
- Updated dependencies [1d2ec66]
- Updated dependencies [1d2ec66]
- Updated dependencies [1d2ec66]
  - @bpmnkit/core@0.3.0

## 0.0.3

### Patch Changes

- Updated dependencies [00a65f5]
  - @bpmnkit/core@0.2.0

## 0.0.2

### Patch Changes

- 9cd1942: Improvements around AI integration
- Updated dependencies [9cd1942]
  - @bpmnkit/core@0.1.2
  - @bpmnkit/feel@0.0.20
