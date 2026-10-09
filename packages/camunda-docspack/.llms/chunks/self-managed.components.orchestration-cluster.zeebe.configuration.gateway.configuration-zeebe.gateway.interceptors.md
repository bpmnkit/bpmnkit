# Gateway configuration — Configuration — zeebe.gateway.interceptors

It is possible to intercept requests in the gateway, which can be configured via environment variables or the `application.yaml` file. For more details, read about [interceptors](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/interceptors).

Each interceptor should be configured with the values described below:

    
        
            Field
            Description
            Example value
        
    
    
        
            id
            Identifier for this interceptor. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_INTERCEPTORS_0_ID`.
            
        
        
            jarPath
            Path (relative or absolute) to the JAR file containing the interceptor class and its dependencies. All classes must be compiled for the same language version as Zeebe or lower. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_INTERCEPTORS_0_JARPATH`.
            
        
        
            className
            
              Entry point of the interceptor, a class which must:
              implement io.grpc.ServerInterceptor
              have public visibility
              have a public default constructor (i.e. no-arg constructor)
        This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_INTERCEPTORS_0_CLASSNAME`.
        
            
        
    

#### YAML snippet

```yaml
interceptors:
  id: null
  jarPath: null
  className: null
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway
