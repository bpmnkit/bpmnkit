# Red Hat OpenShift — Deploy Camunda 8 via Helm charts — kubernetes-ingress

[Routes](https://docs.openshift.com/container-platform/latest/networking/routes/route-configuration.html) serve as OpenShift's default Ingress implementation.

If you find that its features aren't suitable for your needs, or if you prefer to use a Kubernetes-native Ingress controller, such as the [ingress-nginx controller](https://github.com/kubernetes/ingress-nginx), [you have that option](https://www.redhat.com/en/blog/a-guide-to-using-routes-ingress-and-gateway-apis-in-kubernetes-without-vendor-lock-in).

For guidance on installing an Ingress controller, you can refer to the [Ingress Setup documentation](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup).

**Note: Difference between ingress-nginx and NGINX Ingress**

Do not confuse the [ingress-nginx controller](https://github.com/kubernetes/ingress-nginx) with the [NGINX Ingress Controller](https://www.redhat.com/en/blog/using-nginx-ingress-controller-red-hat-openshift) that is endorsed by Red Hat for usage with OpenShift. Despite very similar names, they are two different products.

If you should decide to use the Red Hat endorsed [NGINX Ingress Controller](https://www.redhat.com/en/blog/using-nginx-ingress-controller-red-hat-openshift), you would require additional adjustments done to the Camunda 8 Ingress objects and the NGINX Ingress Controller itself to make `gRPC` and `HTTP/2` connections work. In that case, please refer to the [example and the prerequisites](https://github.com/nginxinc/kubernetes-ingress/blob/main/examples/ingress-resources/grpc-services/README.md).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift
