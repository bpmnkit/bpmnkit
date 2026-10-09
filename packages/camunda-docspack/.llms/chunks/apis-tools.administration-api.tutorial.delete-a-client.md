# Tutorial — DELETE a client

To delete a client, take the following steps:

1. Outline your function, similar to the steps above:

```javascript
async function deleteClient([clientId]) {
  const accessToken = await getAccessToken(authorizationConfiguration);

  const administrationApiUrl = process.env.ADMINISTRATION_API_URL;
  const clusterId = process.env.CLUSTER_ID;

  const url = `${administrationApiUrl}/clusters/${clusterId}/clients/${clientId}`;
}
```

2. Configure the API call using the DELETE method:

```javascript
var options = {
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
  const response = await axios(options);

  if (response.status === 204) {
    console.log(`Client ${clientId} was deleted!`);
  } else {
    console.error("Unable to delete client!");
  }
} catch (error) {
  console.error(error.message);
}
```

4. In your terminal, run `npm run cli admin delete <client ID>`, where `<client ID>` is where you can paste the ID of the client you would like to delete.

---
Source: https://docs.camunda.io/docs/next/apis-tools/administration-api/tutorial
