# Configure the Helm chart with Ingress — Ingress controllers — Use an AWS Application Load Balancer

An AWS Application Load Balancer (ALB) terminates TLS at the load balancer with a certificate from AWS Certificate Manager (ACM). For the limits, see the [ALB known limitations](https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes#application-load-balancer-alb).

1. Deploy the [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/).
1. Set up a [certificate in AWS Certificate Manager](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html).
1. Set the `alb` class on every Ingress object the chart renders. The web application Ingress objects read `global.ingress`, and the Zeebe gRPC Ingress reads `orchestration.ingress.grpc`.
1. Set `alb.ingress.kubernetes.io/backend-protocol-version: GRPC` only on the Zeebe gRPC Ingress, as in the [AWS gRPC example](https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/main/docs/examples/grpc_server.md). On a web application Ingress, this annotation makes the ALB target groups use gRPC and breaks the HTTP applications.
1. Add the values to your `values.yaml` file:

   ```yaml
   global:
     compatibility:
       nginx:
         # Stop the chart from adding its default Ingress-nginx annotations.
         renderAnnotations: false
     ingress:
       className: alb
       # TLS terminates at the ALB. An empty secretName lists the hosts without a Secret.
       tls:
         enabled: true
         secretName: ""
       annotations:
         alb.ingress.kubernetes.io/ssl-redirect: "443"
         alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
         alb.ingress.kubernetes.io/scheme: internet-facing
         alb.ingress.kubernetes.io/target-type: ip

   orchestration:
     ingress:
       grpc:
         className: alb
         tls:
           enabled: true
           secretName: ""
         annotations:
           alb.ingress.kubernetes.io/ssl-redirect: "443"
           alb.ingress.kubernetes.io/backend-protocol-version: GRPC
           alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
           alb.ingress.kubernetes.io/scheme: internet-facing
           alb.ingress.kubernetes.io/target-type: ip
   ```

The ALB terminates TLS with the ACM certificate, so you don't need a TLS Secret. With `tls.enabled: true` and an empty `secretName`, the chart lists each host under the Ingress [`tls` field](https://kubernetes.io/docs/concepts/services-networking/ingress/#tls) without a Secret. The AWS Load Balancer Controller uses these hosts to find the matching ACM certificate. The chart also uses `https` in the URLs it generates, for example in the release information.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup
