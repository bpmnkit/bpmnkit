# bpmnkit-cli

The `bpmnkit` command line (alias `casen`): native commands, `bpmnkit-<name>` subprocess plugins and a fallback to the legacy Node CLI. This crate ships the binary; the libraries are in the other `bpmnkit-*` crates.

## Install

```sh
cargo install bpmnkit-cli   # or: npm install -g @bpmnkit/cli, brew install bpmnkit/tap/bpmnkit-cli
```

## Usage

`bpmnkit --help` lists the commands; `bpmnkit self update` updates installer-based installs.

Part of [BPMN Kit](https://bpmnkit.com). MIT OR Apache-2.0.
