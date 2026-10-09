# SAP RFC connector — Working with the SAP RFC connector in Camunda Hub and Desktop Modeler

### Modeling options

To use the **SAP RFC connector** in your process, either change the type of existing task by clicking on it and selecting the **Change element** menu icon, or create a new connector task by using the **Append connector** context menu. Follow our [guide to using connectors](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index) to learn more.

![sap-rfc-connector-task-in-model](./img/sap-rfc-connector-element-template.png)

First, choose whether to call a `BAPI` or a Function Module (`FM`).

Then, provide the `exporting`-, `importing-`, and `tables` parameters as lists of objects.

All object entries in the list look similar to `[{name:"param", type:"type"}]`, pointing to the parameter name of the BAPI/FM and its type. For example, `[{name:"PERSON_IN_CHARGE_FROM", type:"BAPI0012_GEN-PERS_IN_CHRG"}]`.

For those with experience in `ABAP`, the configuration options are similar.

### Sending variables to the RFC target

The `exporting parameter` is sent to the RFC target. The object structure generally looks like `[{name: "param", type: "type", value: <value> }]`.

Example:

```json
[
  {
    "name": "CONTROLLINGAREA",
    "type": "BAPI0012_GEN-CO_AREA",
    "value": "1000"
  }
]
```

This corresponds with the BAPI's/FM's `importing` definition, meaning it imports these variables from the RFC call:

```ABAP
*"  IMPORTING <-- this is the BAPI/FM - don't be confused! In Camunda, this is "exporting" :)
*"     VALUE(CONTROLLINGAREA) LIKE  BAPI0012_GEN-CO_AREA
```

### Receiving variables from the RFC target

`Importing parameter` is what is expected back from the RFC target. They are configured in the same "list of objects" style pattern in the element template as the other parameters and generally look like `[{name: "param", type: "type"}]`.

Example:

```json
[
  {
    "name": "DETAIL_DATA",
    "type": " BAPI1079_DETAIL"
  }
]
```

This corresponds with the BAPI's/FM's `exporting` definition, meaning it exports these variables to the caller:

```ABAP
*"       EXPORTING
*"             VALUE(DETAIL_DATA) LIKE  BAPI1079_DETAIL
```

### Special cases: sending and/or receiving a "table" and a "changing" structure

#### tables

The `tables parameter` can be both "exporting" and "importing".

**Danger**
Sending tables as tabular data to an RFC target is not yet supported.

```json
{
  "name": "COSTCENTERLIST",
  "type": "BAPI0012_CCLIST"
}
```

The above example is an object parameter in the `tables parameter` section that describes a result table to be received back from the RFC call. In conforms with the BAPI `BAPI_COSTCENTER_GETLIST1` parameter definition on the SAP system:

```ABAP
*"  TABLES
*"      COSTCENTERLIST STRUCTURE  BAPI0012_CCLIST
```

The same is applicable for the return structure `BAPIRET2` that denotes the result status of the RFC call:

```json
{
  "name": "BAPIRET2",
  "isReturn": true
}
```

This aligns with the BAPI definition:

```ABAP
*"  TABLES
*"      ....
*"      RETURN STRUCTURE  BAPIRET2
```

#### changing

A `changing parameter` is a variable received by an RFC target that is processed, changed, and returned. It is only available for `FM`-type RFC targets in the SAP RFC connector. The overall structure is `[{name: "param", type: "type", value: <value> }]`.

Example:

```json
[
  {
    "name": "CV_RESULT",
    "type": "I",
    "value": "100"
  }
]
```

The value `100` is sent to the Fuction Module and sent back as `CV_RESULT`.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/rfc-connector
