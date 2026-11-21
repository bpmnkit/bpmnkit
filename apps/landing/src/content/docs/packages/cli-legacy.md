---
title: "@bpmnkit/cli-legacy"
description: The Node implementation of the bpmnkit command line, kept as the fallback for commands the native binary does not run yet.
sidebar:
  order: 11
---

`@bpmnkit/cli-legacy` is the TypeScript CLI that shipped as `@bpmnkit/cli` 1.x. From 2.0 the
`bpmnkit` command is a native binary (`@bpmnkit/cli`), and this package stays behind it:
the binary runs it with `node` for any command it does not implement yet, passes the exit
code through, and prints a one-line note on stderr.

You rarely install it yourself. `@bpmnkit/cli` depends on it and tells the binary where it is
through `BPMNKIT_LEGACY_CLI`. Set `BPMNKIT_NO_LEGACY=1` to turn the fallback off.

```sh
npm install -g @bpmnkit/cli-legacy   # exposes `bpmnkit-legacy`
```

The fallback is removed after three minor releases of `@bpmnkit/cli` 2.x.

See [the CLI reference](/docs/cli/casen) for the commands.
