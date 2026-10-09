# Initiate a batch operation

In some cases, you’ll need to retry or cancel many process instances at once.

Learn how to initiate [batch operations](https://docs.camunda.io/docs/next/components/concepts/batch-operations) in Camunda 8 Operate.


## Overview

In some cases, you’ll need to retry or cancel many process instances at once. Operate also supports this type of operation.

Imagine a case where many process instances have an incident caused by the same issue. At some point, the underlying problem will have been resolved (for example, maybe a microservice was down for an extended period of time, then was brought back up.)

Though the underlying problem was resolved, the affected process instances are stuck until they are “retried."

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/selections-operations
