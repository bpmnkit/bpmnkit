# CSV connector — Operations — Read CSV (2)

#### Example CSV `Content` input {#example-csv-input}

```csv
product,quantity,price
Wireless Mouse,25,29.99
Office Chair,8,149.50
USB Cable,100,12.99
Monitor Stand,15,45.00
Desk Lamp,32,24.95
```

**Note**
To pass the CSV as a FEEL string through the **Inline Content** source, end lines with `\r\n`. This is the default line separator when reading CSV files. For example:

```
="product,quantity,price\r\nWireless Mouse,25,29.99\r\nOffice Chair,8,149.50\r\nUSB Cable,100,12.99\r\nMonitor Stand,15,45.00\r\nDesk Lamp,32,24.95"
```

#### Example output for row type `Object`

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

Based on the `Object` [example](#example-output-for-row-type-object) above, you can access the CSV data in your result expression for further processing:

```
= {
  sum: sum(for r in records return number(r.quantity))
}
```

#### Example output for row type `Array`

```json
{
  "records": [
    ["Wireless Mouse", "25", "29.99"],
    ["Office Chair", "8", "149.50"],
    ["USB Cable", "100", "12.99"],
    ["Monitor Stand", "15", "45.00"],
    ["Desk Lamp", "32", "24.95"]
  ]
}
```

Based on the `Array` [example](#example-output-for-row-type-array) above, you can access the CSV data in your result expression for further processing:

```
= {
  sum: sum(for r in records return number(r[2]))
}
```

#### Example with record mapping

Based on the data of the `Object` [example](#example-output-for-row-type-object) above, we can use the following [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel) script to extract only the `product` and the `price` converted to a number per record:

```
= {
  product: record.product,
  price: number(record.price)
}
```

Leading to the following output:

```
[
  {"product":"Wireless Mouse","price":29.99},
  {"product":"Office Chair","price":149.5},
  {"product":"USB Cable","price":12.99},
  {"product":"Monitor Stand","price":45},
  {"product":"Desk Lamp","price":24.95}
]
```

We can also use the record mapping as a filter to only include certain records in the final results:

```
= if number(record.price) >= 30 then {product: record.product, price: number(record.price)} else null
```

This will exclude all products with a price lower than 30 from the final results:

```
[
  {"product":"Office Chair","price":149.5},
  {"product":"Monitor Stand","price":45}
]
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/csv
