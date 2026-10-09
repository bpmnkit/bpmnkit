# @bpmnkit/camunda-docspack

## 0.3.0

### Minor Changes

- 310c874: The pack now also covers the rest of the Modeler (DMN, forms, element templates, Desktop Modeler, the modeling rules), the Camunda 7 migration guides, the getting-started guides, the glossary, the supported environments, the public API and release policy pages, c8ctl, the integrations (SAP, ServiceNow, Teams, app integrations), the audit log, wait states, RPA, the frontend-development guides, the Operate, Tasklist, Optimize, Administration and Web Modeler API guides, and the MCP server guides: 7,134 chunks, up from 6,039. A page whose JSX tags span many lines, such as the Hub card grid, no longer leaves its props in the text, and a shared component imported under another name is now recognised.

## 0.2.0

### Minor Changes

- 276b8db: The pack now also covers Self-Managed (deployment, configuration, upgrades), the web components (Operate, Tasklist, Admin, Optimize, Hub, connectors, agentic orchestration, document handling, Zeebe) and the client guides (Java client, Spring Boot starter, the C#, Go, PHP, Python, Rust and TypeScript SDKs, process testing, migration manuals, the Zeebe gRPC API): 5,877 chunks, up from 1,112. The SDKs' generated `api-reference/` pages stay out. Multi-line JSX tags no longer leave their props in the text, and a partial's own imports resolve from its own directory.

### Patch Changes

- Updated dependencies [276b8db]
  - @bpmnkit/docspack@1.2.0

## 0.1.7

### Patch Changes

- 4d8207c: The repository moved to github.com/bpmnkit/bpmnkit. Republished so each package's `repository`, `bugs` and `homepage` metadata and its npm provenance point at the new repository.
- Updated dependencies [4d8207c]
  - @bpmnkit/core@1.4.1
  - @bpmnkit/docspack@1.1.1

## 0.1.6

### Patch Changes

- a7f4e42: The pack is rebuilt from camunda-docs@b4b27e3: 1112 chunks from 393 documents. 64 chunks are new and 120 have changed content. Six chunk ids are gone because upstream renamed or removed their headings. Anything that pins one of them gets no result:
  - `apis-tools.orchestration-cluster-api-rest.specifications.create-agent-instance-history-item.api`
  - `components.best-practices.modeling.naming-technically-relevant-ids.using-naming-conventions-for-bpmn-ids-editing-ids-with-camunda-modeler`
  - `components.concepts.process-applications`
  - `components.concepts.process-applications.next-steps`
  - `components.concepts.secret-resolution.two-resolution-paths`
  - `components.modeler.bpmn.conditional-events.conditional-events.modeling-conditional-events-in-modeler`

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

## 0.1.5

### Patch Changes

- bf2d38d: Better ranking. A line repeated in at least 5% of a pack's chunks no longer counts towards a match: API digest metadata such as `Consistency: eventual.` had made "consistency" almost unsearchable. Sections merged into one chunk now keep their headings as tags. `ask` lists the next five matches by id, and `ask <chunk-id>` returns that one chunk. `answer()` returns them as `more`.
- Updated dependencies [bf2d38d]
  - @bpmnkit/docspack@1.1.0

## 0.1.4

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
  - @bpmnkit/core@1.1.0
  - @bpmnkit/docspack@1.0.1

## 0.1.3

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
- Updated dependencies [0ba6ef6]
- Updated dependencies [d910fae]
- Updated dependencies [0ba6ef6]
  - @bpmnkit/docspack@1.0.0
  - @bpmnkit/core@1.0.0

## 0.1.2

### Patch Changes

- 191d4d2: Keep the published `.llms/` payload's version in step with `package.json`. This pack's payload is committed rather than rebuilt at release — the rebuild needs a `camunda-docs` checkout only the weekly workflow has — so `changeset version` moved `package.json` while `.llms/manifest.json` and `llms.txt` kept the version of the last rebuild. `0.1.0` shipped a manifest claiming `0.0.0`, which fails `docspack doctor` and is reported to every consumer by `docspack list`. `build` now syncs the version before publish; nothing else in the payload is touched.
- Updated dependencies [191d4d2]
- Updated dependencies [191d4d2]
  - @bpmnkit/core@0.8.0
  - @bpmnkit/docspack@0.0.6

## 0.1.1

### Patch Changes

- Updated dependencies [c8ceaaa]
  - @bpmnkit/core@0.7.1

## 0.1.0

### Minor Changes

- 677e58a: Add `@bpmnkit/camunda-docspack`: the Camunda 8.10 documentation — best practices, the BPMN and FEEL references, engine concepts and 227 Orchestration Cluster API operations — as an offline docspack pack, searchable with `bpmnkit-docs ask`. Embedded BPMN diagrams are rendered as text flow descriptions rather than dropped, and links are rewritten to absolute `docs.camunda.io` URLs. Licensed CC BY-SA 3.0, as ShareAlike requires for an adaptation of camunda-docs.

  `@bpmnkit/docspack`: a chunk's heading trail no longer keeps an empty level when a short preamble is merged into the section after it (`Title —  — Section`).

### Patch Changes

- Updated dependencies [677e58a]
  - @bpmnkit/docspack@0.0.5
