# SOAP connector — Usage examples

### Example 1

For example, imagine you want to send the following SOAP request:

URL: `https://myservice:8888/webservice.wso`

Body:

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Object01>
      <Object02>12345</Object02>
    </Object01>
  </soap:Body>
</soap:Envelope>
```

In your BPMN diagram, set the field **Service URL** as `https://myservice:8888/webservice.wso`, and **SOAP body** as:

```json
{
  "Object01": {
    "Object02": 12345
  }
}
```

### Example 2: Pre-defined namespaces

Consider a namespace is defined within your objects, and you want to send the following request:

URL: `https://myservice:8888/webservice.wso`

Body:

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Object01 xmlns="http://www.my.namespace.com/namespace/">
      <Object02>12345</Object02>
    </Object01>
  </soap:Body>
</soap:Envelope>
```

In your BPMN diagram, set the field **Service URL** as `https://myservice:8888/webservice.wso`, and **SOAP body** as:

```json
{
  "ns:Object01": {
    "ns:Object02": 12345
  }
}
```

**Note**
Here, we introduced a new `ns:` prefix. The prefix can be any arbitrary string that is not defined as a namespace.

Now, you'll need to associate a namespace. Set the following value at the **Namespaces** field.
For the given example, it should be set as:

```json
{
  "ns": "http://www.my.namespace.com/namespace/"
}
```

### Example 3: Using templates

As an alternative, you can use templates to send SOAP messages.

URL: `https://myservice:8888/webservice.wso`

Body:

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Object01>
      <Object02>12345</Object02>
    </Object01>
  </soap:Body>
</soap:Envelope>
```

Set the **SOAP body** dropdown to **Template**.

In the **XML template** field, define the template. For example:

```xml
<Object01>
  <Object02>{{myObjectValue}}</Object02>
</Object01>
```

In the **XML template context** field, define context JSON. For example:

```json
{
  "myObjectValue": 12345
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/soap
