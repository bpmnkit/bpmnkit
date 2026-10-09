# CSV connector — Operations — Write CSV

Takes an array of JSON objects and creates a CSV from it. The result can either be stored as a document reference for further processing (for example, uploading) or returned as text.

| Property           | Type             | Description                                                                                                                                                  | Required | Example                                                                                                                                                                                                                                       |
| :----------------- | :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data               | Array            | The CSV data as an array of objects or arrays                                                                                                                | Yes      | [Object](#example-for-an-object-based-data-input) and [Array](#example-for-an-array-based-data-input) example.                                                                                                                                |
| Response format    | Dropdown         | How the generated CSV is returned: **Document reference** stores the CSV in Camunda and returns a reference; **as text** returns the CSV inline as a string. | No       | Defaults to **as text**, which returns a [string](#example-output-for-a-csv-returned-as-a-string). Select **Document reference** to store the CSV in Camunda and return a [document](#example-output-for-a-csv-stored-in-a-document) instead. |
| Encoding           | String           | Character set used when returning the CSV as text. Shown when **Response format** is **as text**.                                                            | No       | Defaults to `UTF-8`                                                                                                                                                                                                                           |
| Delimiter          | String           | The delimiter used to separate each column.                                                                                                                  | No       | Defaults to `,`                                                                                                                                                                                                                               |
| Skip header record | Boolean          | Whether to include the first row in the records or not.                                                                                                      | No       | Defaults to `true`                                                                                                                                                                                                                            |
| Headers            | Array of strings | Can be used when there is no header record present in the record or to change the column names if there is a header record.                                  | No       | Defaults to `[]`. Example: `["name","cost","count"]`. Needs to be specified when using object-based arrays as the `Data` input.                                                                                                               |

**Note**
The **Response format** dropdown replaces the earlier **Create document** boolean. Existing processes built with the previous template keep working: the legacy `createDocument` field is still honored by the connector runtime.

#### Example for an object-based `Data` input

Every record for an object-based `Data` input contains all column names as their property (key) names. The values of the properties
will be written into the CSV.

```json
{
  "records": [
    { "product": "Wireless Mouse", "quantity": "25", "price": "29.99" },
    { "product": "Office Chair", "quantity": "8", "price": "149.50" },
    { "product": "USB Cable", "quantity": "100", "price": "12.99" },
    { "product": "Monitor Stand", "quantity": "15", "price": "45.00" },
    { "product": "Desk Lamp", "quantity": "32", "price": "24.95" }
  ]
}
```

**Info**

`Headers` must be specified when using object-based arrays as the `Data` input
when writing a CSV. The `Headers` must match the property names of the objects. For the example above,
one would provide the following value for `Headers`:

```json
=["product", "quantity", "price"]
```

#### Example for an array-based `Data` input

Every record for an array-based `Data` input contains all values in a single array per row.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/csv
