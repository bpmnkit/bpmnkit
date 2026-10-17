# SAP RFC connector — Query result structure

### BAPI

The result of a call to a BAPI holds the following JSON structure:

```json
{
  tables: [
  	{ ... }
	],
  importing: {
    { ... }
  }
]
```

`tables` holds a representation of the result tables configured.

`importing` is the result of what was sent to the BAPI in the `exporting` section above.

### Function Module

The result of a call to a Function Module holds the following JSON structure:

```json
{
  tables: [
  	{ ... }
	],
  importing: [
    { ... }
  ],
  changing: [
    { ... }
  ]
]
```

- `tables` holds a representation of the result tables configured.
- `importing` is the result of what was sent to the Function Module in the `exporting` section above.
- `changing` is the result of what was sent to the Function Module in the `changing` section above.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/rfc-connector
