---
title: bpmnkit Plugins
description: Official bpmnkit CLI plugins shipped with the BPMN Kit monorepo.
sidebar:
  order: 7
---

> **Auto-generated** — this page is built from `plugins-cli/*/package.json` during the site
> build. Do not edit it by hand.

Official plugins extend `bpmnkit` with domain-specific command groups. Install them with:

```sh
bpmnkit plugin install <name>
```

## Available Plugins

| Plugin | Description |
|--------|-------------|
| [`@bpmnkit/casen-report`](#-bpmnkit-casen-report) | Render HTML reports from Camunda 8 incident and SLA data |
| [`@bpmnkit/casen-worker-ai`](#-bpmnkit-casen-worker-ai) | AI task worker plugin for bpmnkit — classify, summarize, extract, and decide using Claude |
| [`@bpmnkit/casen-worker-http`](#-bpmnkit-casen-worker-http) | Example bpmnkit worker plugin — processes HTTP connector jobs using the JSONPlaceholder API |

---

## `@bpmnkit/casen-report`

Render HTML reports from Camunda 8 incident and SLA data

### Installation

```sh
bpmnkit plugin install @bpmnkit/casen-report
```

| Command | Description |
|---------|-------------|
| `bpmnkit report incidents` | Generate an HTML report of current incidents grouped by process |
| `bpmnkit report sla` | Generate an SLA compliance report for process instances |

---

## `@bpmnkit/casen-worker-ai`

AI task worker plugin for bpmnkit — classify, summarize, extract, and decide using Claude

### Installation

```sh
bpmnkit plugin install @bpmnkit/casen-worker-ai
```

| Command | Description |
|---------|-------------|
| `bpmnkit ai-worker classify` | Classify text into one of the given categories |
| `bpmnkit ai-worker summarize` | Summarize text to a given length and style |
| `bpmnkit ai-worker extract` | Extract structured fields from unstructured text |
| `bpmnkit ai-worker decide` | Make a boolean decision based on a question, context, and optional policy |

---

## `@bpmnkit/casen-worker-http`

Example bpmnkit worker plugin — processes HTTP connector jobs using the JSONPlaceholder API

### Installation

```sh
bpmnkit plugin install @bpmnkit/casen-worker-http
```

| Command | Description |
|---------|-------------|
| `bpmnkit http-worker start` | Subscribe to HTTP connector jobs and complete them with live API data |

---

## Authoring Plugins

See the [Plugin Authoring](/docs/cli/plugin-authoring) guide to build and publish your own `bpmnkit` plugin.
