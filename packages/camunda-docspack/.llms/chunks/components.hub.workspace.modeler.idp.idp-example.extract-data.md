# Example IDP integration — Extract data

In this step, the document extraction template is [applied to a task](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-integrate#create-and-configure-an-idp-task) to automatically extract data from the uploaded document.

- **Input message data**: The **Document** input uses the FEEL expression `documents[1]` to get the first document in the FEEL array, as per the uploaded document **Key**.
- **Output mapping**: The extracted data is stored as JSON in a **Result variable** named `idpResult`.


## View results

Once the process completes, the results of the extraction are available in the `idpResult` variable.

For example, viewing the process in Operate shows the data was accurately extracted from the document as follows:

```
{
  "extractedFields": {
    "invoiceType": "A",
    "invoiceId": "A/3454",
    "invoiceCustomer": "Camunda"
  }
}
```

**Note**
This step in the process could be one of many types of element, depending on what you want to do with the extraction results. For example, you might want to display, check, or summarize the extracted data, or route to further actions in the process depending on the document data extracted by IDP.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-example
