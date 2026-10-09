# Gateway configuration — Configuration — zeebe.gateway.filters

It is possible to filter REST API requests in the gateway, which can be configured via environment variables or the `application.yaml` file. For more details, read about [filters](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/filters).

Each filter should be configured with the values described below:

    
        
            Field
            Description
            Example value
        
    
    
        
            id
            Identifier for this filter. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_FILTERS_0_ID`.
            
        
        
            jarPath
            Path (relative or absolute) to the JAR file containing the filter class and its dependencies. All classes must be compiled for the same language version as Zeebe or lower. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_FILTERS_0_JARPATH`.
            
        
        
            className
            
              Entry point of the filter, a class which must:
              implement jakarta.servlet.Filter
              have public visibility
              have a public default constructor (i.e. no-arg constructor)
        This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_FILTERS_0_CLASSNAME`.
        
            
        
    

#### YAML snippet

```yaml
filters:
  id: null
  jarPath: null
  className: null
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway
