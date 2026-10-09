# Property reference — Configuration of the `restapi` component — application.yaml

```yaml
camunda.hub.mail:
  from-address: noreply@example.com
  from-name: Camunda # optional, default: Camunda

spring:
  mail:
    host: smtp.example.com
    port: 587
    user: hub-user # optional
    password: "***" # optional
    properties:
      mail.smtp.auth: true # set to true if user and password are provided
      mail.smtp.starttls.enable: true # default: true; set to false to disable STARTTLS encryption
      mail.smtp.starttls.required: true # default: true; set to false to avoid enforcing STARTTLS
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
