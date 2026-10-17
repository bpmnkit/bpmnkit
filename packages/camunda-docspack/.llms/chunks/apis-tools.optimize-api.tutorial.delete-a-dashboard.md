# Tutorial — DELETE a dashboard

To delete a dashboard, capture its ID from the previous exercise and take the following steps:

1. Outline your function, similar to the steps above. Note that the URL endpoint will look different, as you are accessing a different endpoint in this request (using a dashboard ID) than in the prior request (using a collection ID):

```javascript
async function deleteDashboard([dashboardId]) {
  console.log(`deleting dashboard ${dashboardId}`);

  const accessToken = await getAccessToken(authorizationConfiguration);

  const optimizeApiUrl = process.env.OPTIMIZE_BASE_URL;
  const url = `${optimizeApiUrl}/api/public/dashboard/${dashboardId}`;
}
```

2. Configure the API call using the DELETE method:

```javascript
const options = {
  method: "DELETE",
  url,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
};
```

3. Process the results from the API call. For example:

```javascript
try {
  // Call the delete endpoint.
  const response = await axios(options);

  // Process the results from the API call.
  if (response.status === 204) {
    console.log(`Dashboard ${clientId} was deleted!`);
  } else {
    // Emit an unexpected error message.
    console.error("Unable to delete dashboard!");
  }
} catch (error) {
  // Emit an error from the server.
  console.error(error.message);
}
```

4. In your terminal, run `node cli.js optimize delete <dashboard ID>`, where `<dashboard ID>` is where you can paste the ID of the dashboard you would like to delete. You will see a response similar to the following:

`Dashboard 12345 was deleted!`

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/tutorial
