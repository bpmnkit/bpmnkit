# Tutorial — Getting started

- A detailed API description can be found [here](https://console.cloud.camunda.io/customer-api/openapi/docs/#/) via Swagger. With a valid access token, this offers an interactive API experience against your Camunda 8 cluster.
- You need authentication to access the API endpoints. Find more information [here](https://docs.camunda.io/docs/next/apis-tools/administration-api/authentication).


## Set up authentication

If you're interested in how we use a library to handle auth for our code, or to get started, examine the `auth.js` file in the GitHub repository. This file contains a function named `getAccessToken` which executes an OAuth 2.0 protocol to retrieve authentication credentials based on your client ID and client secret. Then, we return the actual token that can be passed as an authorization header in each request.

To set up your credentials, create an `.env` file which will be protected by the `.gitignore` file. You will need to add your `CLUSTER_ID`, `ADMINISTRATION_CLIENT_ID`, `ADMINISTRATION_CLIENT_SECRET`, `ADMINISTRATION_AUDIENCE`, which is `api.cloud.camunda.io` in a Camunda 8 SaaS environment, and `ADMINISTRATION_API_URL`, which is `https://api.cloud.camunda.io`.

These keys will be consumed by the `auth.js` file to execute the OAuth protocol, and should be saved when you generate your client credentials in [prerequisites](#prerequisites).

**Tip: Can't find your environment variables?**
When you create new client credentials as a [prerequisite](#prerequisites), your environment variables appear in a pop-up window. Your environment variables may appear as `CAMUNDA_CONSOLE_CLIENT_ID`, `CAMUNDA_CONSOLE_CLIENT_SECRET`, `CAMUNDA_CONSOLE_OAUTH_AUDIENCE`, and `CAMUNDA_CONSOLE_BASE_URL`.

Locate your `CLUSTER_ID` in Camunda Hub:

1. In Camunda Hub, in the left navigation, click **Environments**, and then click **Clusters**.
1. Select a cluster.
1. Under **Cluster Details**, copy your **Cluster Id**.

Examine the existing `.env.example` file for an example of how your `.env` file should look upon completion. Do not place your credentials in the `.env.example` file, as this example file is not protected by the `.gitignore`.

**Note**

In this tutorial, we will execute arguments to view, create, and delete clients. You can examine the framework for processing these arguments in the `cli.js` file before getting started.

---
Source: https://docs.camunda.io/docs/next/apis-tools/administration-api/tutorial
