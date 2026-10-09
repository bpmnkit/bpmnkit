# Properties reference — `camunda.client.cluster-variables.variables`

Cluster variables to set at startup. Each entry carries a name, a value and optionally metadata, a kind and a tenant ID. Entries without a tenant ID are globally scoped.

  
    Property
    Description
    Default value
  

  

The name of the cluster variable.

Type: string

  null

  

The value of the cluster variable.

Type: object

  null

  

The metadata of the cluster variable.

Type: map[string,object]

  null

  

The kind of the cluster variable.

Type: enum[json, secretReference]

  null

  

The tenant ID of the cluster variable.

Type: string

  null

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/properties-reference
