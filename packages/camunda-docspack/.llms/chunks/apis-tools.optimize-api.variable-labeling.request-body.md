# Variable labeling — Request body

The request body should contain a reference to the process definition using its key, as well as an array of variable labels. Each variable label object in the array must specify the name and type of the variable for which a label is being added, as well as the value of the label itself.


## Result

This method returns no content.


## Response codes

Possible HTTP Response Status codes:

| Code | Description                                                                            |
| ---- | -------------------------------------------------------------------------------------- |
| 204  | Request successful.                                                                    |
| 400  | Returned if some of the properties in the request body are invalid or missing.         |
| 401  | Token incorrect or missing. See [authentication](#authentication) on how to authorize. |
| 404  | The process definition with the given definition key doesn't exist.                    |

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/variable-labeling
