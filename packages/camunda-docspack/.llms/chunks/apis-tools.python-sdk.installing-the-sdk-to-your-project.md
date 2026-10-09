# Installing the SDK to your project

# Installing the SDK to your project


## Requirements

- Python 3.10 or later


## Stable release (recommended for production)

The stable version tracks the latest supported Camunda server release. The first stable release will be **8.9.0**.

```bash
pip install camunda-orchestration-sdk
```


## Pre-release / dev channel

Pre-release versions (e.g. `8.9.0.dev2`) are published from the `main` branch and contain the latest changes targeting the next server minor version. Use these to preview upcoming features or validate your integration ahead of a stable release.

```bash
# pip
pip install --pre camunda-orchestration-sdk

# pin to a specific pre-release
pip install camunda-orchestration-sdk==8.9.0.dev2
```

In a `requirements.txt`:

```text
camunda-orchestration-sdk>=8.9.0.dev1
```

> **Note:** Pre-release versions may contain breaking changes between builds. Pin to a specific version if you need reproducible builds.

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/installing-the-sdk-to-your-project
