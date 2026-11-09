# Rust crates — Overview

The `bpmnkit-*` crates are a Rust implementation of BPMN Kit's core. They are the Rust twin of
the TypeScript packages and are built next to them, not instead of them. JavaScript hosts
(browser, Node, the editor) keep using `@bpmnkit/*`. Rust programs (CLIs, servers, the desktop
app) use the crates natively, with no JS runtime.

The reebe engine (`apps/reebe`) runs on these crates. It parses BPMN and DMN and evaluates FEEL
through them.

The `bpmnkit` crate is the front door: one dependency that re-exports the other crates as
modules behind cargo features.

---
Source: https://bpmnkit.com/docs/packages/rust-crates
