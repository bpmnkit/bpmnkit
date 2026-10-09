# Configuration — React to events

The Camunda Spring Boot Starter integrates with Spring events and also publishes its own events.

### Camunda client lifecycle events

#### Camunda client created

To react when the Camunda client is created, add an event listener:

```java
@EventListener
public void onCamundaClientCreated(CamundaClientCreatedEvent event) {
  // do what you need to do
}
```

#### Camunda client closing event

To react on the closing of the Camunda client, you can do this:

```java
@EventListener
public void onCamundaClientClosing(CamundaClientClosingEvent event) {
  // do what you need to do
}
```

#### Lifecycle aware interface

To subscribe to the Camunda client lifecycle at once, you can also use an interface:

```java
@Component
public class CamundaLifecycleListener implements CamundaClientLifecycleAware {
  @Override
  public void onStart(CamundaClient client) {
    // do what you need to do
  }

  @Override
  public void onStop(CamundaClient client) {
    // do what you need to do
  }
}
```

In a [multi-client](#multi-client-configuration-physical-tenants) application, one `CamundaClientCreatedSpringEvent`/`CamundaClientClosingSpringEvent` fires per configured client, each carrying that client's name — listen for these instead if you need to tell clients apart.

### Post deployment event

To react on the creation of [deployments on start-up](#deploying-resources-on-start-up), you can do this:

```java
@EventListener
public void onDeploymentCreated(CamundaPostDeploymentEvent event) {
  // do what you need to do
}
```

The event will grant you access to a list of deployments that have been created.

In a [multi-client](#multi-client-configuration-physical-tenants) application, one event fires per configured client, since `@Deployment` resources are deployed to every configured client.

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
