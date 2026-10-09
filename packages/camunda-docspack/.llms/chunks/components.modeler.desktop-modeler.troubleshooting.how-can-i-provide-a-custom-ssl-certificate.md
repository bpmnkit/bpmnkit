# Troubleshooting — How can I provide a custom SSL certificate?

You configured a custom SSL certificate in your (remote) Zeebe endpoint and want Desktop Modeler to accept that certificate.

The app [strictly validates](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/flags/flags#zeebe-ssl-certificate) the remote server certificate trust chain. If you use a custom SSL server certificate, you must make the signing CA certificate known to Desktop Modeler, not the server certificate itself.

Desktop Modeler reads trusted certificate authorities from your operating systems trust store. Installing custom CA certificates in that trust store is recommended for most users. Alternatively, you may provide custom trusted CA certificates via the [`--zeebe-ssl-certificate` flag](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/flags/flags#zeebe-ssl-certificate).

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/troubleshooting
