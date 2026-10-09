# SOAP connector — SOAP message

### SOAP version

Select the desired version of the SOAP service.

### SOAPAction HTTP header

Enter the SOAPAction HTTP header that will be used in the request. Leave this value blank if the SOAPAction HTTP header
won't be used in your request. This field is only required by SOAP version 1.1.

### SOAP header

From the dropdown, select whether the **SOAP header** is required, and if so, in which format you wish to provide it.

### SOAP body

From the **SOAP body** dropdown, select whether you will provide the SOAP request body in a form of **Template**, or
**XML compatible JSON**.

#### Template

When **Template** is chosen, enter the **XML template** value, for example `<camunda:Param><camunda:ParamType>{{paramValue}}</camunda:ParamType></camunda:Param>`.

Enter the **XML template context** value, for example `={paramValue: 1234567890}`, and enter the **Namespaces** value, for example `={"camunda":"http://my.service.com/webservicesserver/"}`.

#### XML compatible JSON

When **XML compatible JSON** is chosen, enter the **JSON definition**, for example

```json
= {
  "camunda:Object01": {
    "camunda:Object02": myObjectValue
  }
}
```

Enter the **Namespaces** value, for example `={"camunda":"http://my.service.com/webservicesserver/"}`.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/soap
