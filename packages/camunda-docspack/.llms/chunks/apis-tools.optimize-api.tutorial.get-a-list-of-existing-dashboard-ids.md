# Tutorial — GET a list of existing dashboard IDs

First, let's script an API call to list our existing dashboard IDs.

To do this, take the following steps:

1. In the file named `optimize.js`, outline the authentication and authorization configuration in the first few lines. This will pull in your `.env` variables to obtain an access token before making any API calls:

```javascript
const authorizationConfiguration = {
  clientId: process.env.OPTIMIZE_CLIENT_ID,
  clientSecret: process.env.OPTIMIZE_CLIENT_SECRET,
  audience: process.env.OPTIMIZE_AUDIENCE,
};
```

2. Examine the function `async function listDashboards([collectionId])` below this configuration. This is where you will script out your API call.
3. Within the function, you must first apply an access token for this request, so your function should now look like the following:

```javascript
async function listDashboards([collectionId]) {
  const accessToken = await getAccessToken(authorizationConfiguration);
}
```

4. Using your generated client credentials from [prerequisites](#prerequisites), capture your Optimize API URL beneath your call for an access token by defining `optimizeApiUrl`:

`const optimizeApiUrl = process.env.OPTIMIZE_BASE_URL;`

5. On the next line, script the API endpoint to list your existing dashboard IDs for a particular collection:

```javascript
const url = `${optimizeApiUrl}/api/public/dashboard?collectionId=${collectionId}`;
```

6. Configure your GET request to the appropriate endpoint, including an authorization header based on the previously acquired `accessToken`:

```javascript
const options = {
  method: "GET",
  url,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
};
```

7. Call the collection's endpoint, process the results from the API call, emit the dashboard IDs to output, and emit an error message from the server if necessary:

```javascript
try {
  const response = await axios(options);
  const results = response.data;

  results.forEach((x) => console.log(`ID: ${x.id}`));
} catch (error) {
  // Emit an error from the server.
  console.error(error.message);
}
```

8. In your terminal, run `node cli.js optimize list <collection ID>`, where `<collection ID>` is where you can paste the ID of your collection for a list of your existing dashboard IDs within this particular collection. If you have any existing dashboards within a collection, you will see an output similar to the following:

`ID: 12345`

**Note**
This `list` command is connected to the `listDashboards` function at the bottom of the `optimize.js` file, and executed by the `cli.js` file. While we will view dashboard IDs and delete a dashboard in this tutorial, you may add additional arguments depending on the API calls you would like to make.

If you have any existing dashboards, the `ID: ${x.id}` will now output. If you have an invalid API name or action name, or no arguments provided, or improper/insufficient credentials configured, an error message will output as outlined in the `cli.js` file.

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/tutorial
