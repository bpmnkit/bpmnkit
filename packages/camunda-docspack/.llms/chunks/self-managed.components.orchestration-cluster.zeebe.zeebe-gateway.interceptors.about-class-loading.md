# Interceptors — About class loading

[Previously](#packaging-an-interceptor), we stated that you need to package the
interceptor class into a fat JAR. Although good general advice, this is not
entirely true. To understand why, let's discuss how the class loading of your
interceptor works.

When your JAR is loaded into the gateway, Zeebe provides a special class loader
for it. This class loader isolates your interceptor from the rest of Zeebe, but
it also exposes our own code to your interceptor. When loading classes for your
interceptor, it will always first look in this special class loader and only if
it is not available it will look in Zeebe's main class loader. In other words,
you can access any classes from Zeebe's main class loader when they are not
provided by your JAR. For internal class loading, Zeebe will still only look in
its main class loader.

This means you can reduce your JAR size by leaving out libraries that are
already provided by Zeebe's class loader. In addition, if your interceptor
depends on a different version of a class than the one provided by Zeebe, then
you can provide your own version without having to worry about breaking Zeebe.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/interceptors
