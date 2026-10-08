# Connectors in AI Generation — Proving it runs

A diagram that parses is not yet a process that runs. Two checks follow every connected
result:

- **Dry run.** [`dryRun`](/docs/guides/testing-processes#dry-run) runs the process once from
  start to end. Every connector answers an empty HTTP 200, and every other job completes.
  Messages are delivered and timers fire. It says whether the run reached the end, or where
  it stopped and why.
- **Secrets.** `listSecrets` lists every secret the diagram reads, so you can create them in
  the cluster before deploying.


## Where you meet it

- **[Drop](/docs/guides/drop).** "Describe a process" drafts the diagram, connects it, and
  shows the secrets and the dry run. A shared diagram has **Add connectors** while editing.
- **CLI.**
  - `casen connector cards "<request>"` prints connector cards.
  - `casen connector api "<request>"` prints the endpoints of an indexed API.
  - `casen synth --check` dry-runs a compiled plan and lists its secrets.
- **The proxy's MCP server.** It is used by the AI chat and by your own agents:
  - `find_connectors { query }` returns cards and API endpoints.
  - `add_connector { processId, id, alias, operation, values }` configures a node through
    the same resolver.
- **Studio.** **Try it** runs a model on the local engine. GET requests go out for real;
  every other connector and task is simulated.

---
Source: https://bpmnkit.com/docs/guides/ai-connectors
