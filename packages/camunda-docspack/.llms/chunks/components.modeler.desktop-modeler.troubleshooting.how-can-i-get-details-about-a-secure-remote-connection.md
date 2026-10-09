# Troubleshooting — How can I get details about a secure remote connection?

You can use the following command to retrieve information about HTTP/2 over TLS support (ALPN) and certificates provided by a remote endpoint:

```sh
> openssl s_client -alpn h2 -connect google.com:443 -servername google.com
[...]
---
Certificate chain
 0 s:/CN=*.google.com
   i:/C=US/O=Google Trust Services LLC/CN=GTS CA 1C3
 1 s:/C=US/O=Google Trust Services LLC/CN=GTS CA 1C3
   i:/C=US/O=Google Trust Services LLC/CN=GTS Root R1
 2 s:/C=US/O=Google Trust Services LLC/CN=GTS Root R1
   i:/C=BE/O=GlobalSign nv-sa/OU=Root CA/CN=GlobalSign Root CA
---
[...]
---
New, TLSv1/SSLv3, Cipher is AEAD-CHACHA20-POLY1305-SHA256
Server public key is 256 bit
Secure Renegotiation IS NOT supported
Compression: NONE
Expansion: NONE
ALPN protocol: h2
SSL-Session:
    Protocol  : TLSv1.3
    Cipher    : AEAD-CHACHA20-POLY1305-SHA256
    Session-ID:
    Session-ID-ctx:
    Master-Key:
    Start Time: 1687516295
    Timeout   : 7200 (sec)
    Verify return code: 0 (ok)
---
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/troubleshooting
