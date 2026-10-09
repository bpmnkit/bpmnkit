# Connect Admin to an identity provider — Machine-to-machine (M2M) API access — springclient

1. Add the dependency to your Java Project:

```xml
<dependency>
    <groupId>io.camunda</groupId>
    <artifactId>camunda-spring-boot-starter</artifactId>
    <version>${version.camundastarter}</version>
</dependency>
```

2. Configure your application.yaml:

```yaml
camunda:
  client:
    mode: self-managed
    auth:
      client-id: <YOUR_CLIENT_ID>
      client-secret: <YOUR_CLIENT_SECRET>
      token-url: <YOUR_AUTHORIZATION_SERVER>
      audience: <YOUR_CLIENT_ID>
      scope: <YOUR_CLIENT_ID_FROM_OC>
    grpc-address: grpc://localhost:26500
    rest-address: http://localhost:8080
```

3. Verify authentication in code:

```java
@SpringBootApplication
public class App implements CommandLineRunner
{
	  @Autowired
	  private CamundaClient client;

	  public static void main(String[] args) {
		  SpringApplication.run(App.class, args);

	  }
	  @Override
		public void run(final String... args) {
		  Topology t = client.newTopologyRequest().send().join();
		    System.out.println(t.toString());
	  }
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
