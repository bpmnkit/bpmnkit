# Properties reference — `camunda.client.deployment`

Properties for automatic deployment at startup.

  
    Property
    Description
    Default value
  

  

Indicates if the `@Deployment` annotation is processed.

Type: boolean

  true

  

Indicates if the resources selected by the deployment annotation have to reside in the same jar as the annotated class. This property acts as the default behavior. If the `@Deployment` annotation explicitly sets its `ownJarOnly` parameter, that annotation-level value overrides this property for the annotated deployment.

Type: boolean

  false

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/properties-reference
