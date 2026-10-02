# casen connector — Browse the bundled OOTB catalog

```sh
casen connector search slack
casen connector show io.camunda.connectors.Slack.v1
```

`search` scores the 133 bundled templates by keyword match and prints a table (template id,
direction, task type, description). `show` prints a template's task type, direction, and its
required/optional input keys — these are the keys a `ProcessPlan` `connector` step's `values`
object uses (see [Building Processes with AI](/docs/guides/ai-implement)):

```
$ casen connector show io.camunda.connectors.Slack.v1
Slack connector  (io.camunda.connectors.Slack.v1)
Task type: io.camunda:slack:1
Direction: outbound
Create a channel or send a message to a channel or user

Required inputs:
  token (secret) — OAuth token
  data.channel — Channel/user name/email
  data.text — Message
  ...
```

A field marked `(secret)` should be supplied as a `{{secrets.NAME}}` placeholder, never a literal
credential. This is the same catalog `@bpmnkit/connectors`' `listConnectors()`/`searchConnectors()`
expose programmatically.

`show` lists every input of a template, whichever operation it belongs to: GitHub's lists `owner`
for each of its operations. `cards` answers a request with one card per operation instead, each with
only the inputs that operation uses, and the `values` that select it:

```
$ casen connector cards "create a github issue" --limit 1
github createIssue — GitHub Outbound Connector: Issues / Create an issue | owner* repo* issueTitle* | optional: authentication.pat(secret) githubBody issueAssignees(=FEEL) issueLabels(=FEEL) issueMilestone resultVariable resultExpressionCreateIssue(=FEEL) | authentication.authType=pat: pat | github_app
  values: {"operationGroup":"issues","issueOperationType":"createIssue"}
```

`*` marks a required input. A `mode=default: a | b(…)` part is a choice inside the operation, such
as an authentication type, with the required inputs each choice adds. Retries, timeouts, TLS and
other plumbing are left out unless you pass `--advanced`; `-o json` prints the cards as data.

---
Source: https://bpmnkit.com/docs/cli/connector
