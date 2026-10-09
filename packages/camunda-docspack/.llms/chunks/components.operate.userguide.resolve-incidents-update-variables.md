# Resolve incidents and update variables

Let's examine variable and incidents.

Learn how to resolve incidents and update variables in Camunda 8 Operate.


## Overview

Every process instance created for the [`order-process.bpmn`](/bpmn/operate/order-process.bpmn) process model requires an `orderValue` so the XOR gateway evaluation will happen properly.

Let’s look at a case where `orderValue` is present and was set as a string, but our `order-process.bpmn` model required an integer to properly evaluate the `orderValue` and route the instance.


## Before you begin

To follow this guide, install [`zbctl`](https://github.com/camunda-community-hub/zeebe-client-go/blob/main/cmd/zbctl/zbctl.md), a community-supported command line interface for interacting with Camunda 8.

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/resolve-incidents-update-variables
