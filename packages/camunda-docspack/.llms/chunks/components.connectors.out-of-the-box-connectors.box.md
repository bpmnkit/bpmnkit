# Box connector

Interact with the Box storage API.

The **Box connector** is an outbound connector that allows you to interact with the [Box](https://box.com/) storage API from your BPMN process.


## Prerequisites

To use the **Box connector**, you must have a Box account. You can use an [enterprise account](https://www.box.com/) or create a [developer account](https://developer.box.com/).

The **Box connector** supports different Box API authentication methods, all of which require a [Custom App](https://developer.box.com/guides/applications/app-types/custom-apps/) in your Box account.

- Camunda recommends enabling the **Generate user access tokens** feature in **Advanced Features** in your app configuration. This allows the connector to login as an [app user](https://github.com/box/box-java-sdk/blob/v4.13.1/doc/authentication.md#obtaining-user-token). You can use the **User ID** shown on the overview page in your Box app console.
- Ensure the app is **Authorized** in the **Platform Apps Manager** section of your Box account.

**Note**
A [Custom App](https://developer.box.com/guides/applications/app-types/custom-apps/) is required to interact with the Box API without any manual user interaction during credentials creation when authenticating with the connector.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/box
