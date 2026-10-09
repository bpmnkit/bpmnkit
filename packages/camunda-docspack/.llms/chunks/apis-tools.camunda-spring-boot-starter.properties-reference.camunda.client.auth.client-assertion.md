# Properties reference — `camunda.client.auth.client-assertion`

Properties for OIDC authentication using a client assertion instead of a client secret.

  
    Property
    Description
    Default value
  

  

The alias of the key containing the certificate used to sign the client assertion certificate. If not set, the first alias from the keystore is used.

Type: string

  null

  

The password of the key referenced by the alias. If not set, the keystore password is used.

Type: string

  null

  

The password of the referenced keystore.

Type: string

  null

  

The path to the keystore where the client assertion certificate is stored.

Type: file

  null

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/properties-reference
