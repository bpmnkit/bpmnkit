# Connector runtime performance

Learn how to optimize connector performance in your self-managed environment.

This guide explains how to optimize the configuration of outbound connectors in your self-managed environment to achieve consistent and predictable performance.


## Overview

Connector runtime performance primarily depends on:

- The level of concurrency (`max in-flight` or `max-jobs-active`).
- The performance and rate limits of the external systems your connectors interact with.
- Whether the runtime uses polling or job streaming for job acquisition.

Before tuning the runtime, ensure you have proper observability in place and confirm where the bottleneck is.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/performance
