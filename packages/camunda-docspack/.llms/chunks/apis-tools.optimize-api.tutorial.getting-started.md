# Tutorial — Getting started

- You need authentication to access the API endpoints. Find more information [here](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication).
- To properly execute the commands to list existing dashboard IDs and delete a dashboard, ensure you have [created a collection](https://docs.camunda.io/docs/next/components/optimize/userguide/collections-dashboards-reports) containing a [dashboard](https://docs.camunda.io/docs/next/components/optimize/userguide/creating-dashboards).


## Set up authentication

If you're interested in how we use a library to handle auth for our code, or to get started, examine the `auth.js` file in the GitHub repository. This file contains a function named `getAccessToken` which executes an OAuth 2.0 protocol to retrieve authentication credentials based on your client ID and client secret. Then, we return the actual token that can be passed as an authorization header in each request.

To set up your credentials, create an `.env` file which will be protected by the `.gitignore` file. You will need to add your `OPTIMIZE_CLIENT_ID`, `OPTIMIZE_CLIENT_SECRET`, `OPTIMIZE_BASE_URL`, and `OPTIMIZE_AUDIENCE`, which is `optimize.camunda.io` in a Camunda 8 SaaS environment. For example, your audience may be defined as `OPTIMIZE_AUDIENCE=optimize.camunda.io`.

These keys will be consumed by the `auth.js` file to execute the OAuth protocol, and should be saved when you generate your client credentials in [prerequisites](#prerequisites).

**Tip: Can't find your environment variables?**
When you create new client credentials as a [prerequisite](#prerequisites), your environment variables appear in a pop-up window. Your environment variables may appear as `CAMUNDA_CLIENT_ID`, `CAMUNDA_CLIENT_SECRET`, and `CAMUNDA_OPTIMIZE_BASE_URL`.

Examine the existing `.env.example` file for an example of how your `.env` file should look upon completion. Do not place your credentials in the `.env.example` file, as this example file is not protected by the `.gitignore`.

**Note**

In this tutorial, we will execute arguments to list existing dashboard IDs and delete a dashboard. You can examine the framework for processing these arguments in the `cli.js` file before getting started.

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/tutorial
