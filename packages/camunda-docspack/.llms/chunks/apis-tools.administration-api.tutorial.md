# Tutorial

Step through an example to view your existing clients, create a client, view a particular client's details, and delete a client.

In this tutorial, we'll step through examples to highlight the capabilities of the Administration API, such as viewing your existing clients, creating a client, viewing a particular client's details, and deleting a client.


## Prerequisites

- If you haven't done so already, [create a cluster](https://docs.camunda.io/docs/next/components/react-components/create-cluster).
- Upon cluster creation, create your first client in [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/index) by navigating to **Organization > Manage organization > Administration API > Create new credentials**. Ensure you determine the scoped access for client credentials. For example, in this tutorial we will get, create, and delete a client. Ensure you check all the boxes for Zeebe client scopes.

**Note**
Make sure you keep the generated client credentials in a safe place. The **Client secret** will not be shown again. For your convenience, you can also download the client information to your computer.

- In this tutorial, we utilize a JavaScript-written [GitHub repository](https://github.com/camunda/camunda-api-tutorials) to write and run requests. Clone this repo before getting started.
- Ensure you have [Node.js](https://nodejs.org/en/download) installed as this will be used for methods that can be called by the CLI (outlined later in this guide). Run `npm install` to ensure you have updated dependencies.

---
Source: https://docs.camunda.io/docs/next/apis-tools/administration-api/tutorial
