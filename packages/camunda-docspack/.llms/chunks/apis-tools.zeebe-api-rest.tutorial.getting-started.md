# Tutorial — Getting started

- You need authentication to access the API endpoints. See [Zeebe REST API authentication](https://docs.camunda.io/docs/next/apis-tools/zeebe-api-rest/zeebe-api-rest-authentication).


## Set up authentication

If you're interested in how we use a library to handle auth for our code, or to get started, examine the `auth.js` file in the GitHub repository. This file contains a function named `getAccessToken` which executes an OAuth 2.0 protocol to retrieve authentication credentials based on your client id and client secret. Then, we return the actual token that can be passed as an authorization header in each request.

To set up your credentials, create an `.env` file which will be protected by the `.gitignore` file. You will need to add your `ZEEBE_CLIENT_ID`, `ZEEBE_CLIENT_SECRET`, `ZEEBE_BASE_URL`, and `ZEEBE_AUDIENCE`, which is `zeebe.camunda.io` in a Camunda 8 SaaS environment. For example, your audience may be defined as `ZEEBE_AUDIENCE=zeebe.camunda.io`.

These keys will be consumed by the `auth.js` file to execute the OAuth protocol, and should be saved when you generate your client credentials in [prerequisites](#prerequisites).

Examine the existing `.env.example` file for an example of how your `.env` file should look upon completion. Do not place your credentials in the `.env.example` file, as this example file is not protected by the `.gitignore`.

**Note**

In this tutorial, we will execute arguments to assign and unassign a user to and from a Zeebe user task. You can examine the framework for processing these arguments in the `cli.js` file before getting started.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api-rest/tutorial
