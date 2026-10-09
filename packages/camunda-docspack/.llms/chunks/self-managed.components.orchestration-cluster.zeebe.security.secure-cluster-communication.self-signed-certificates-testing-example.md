# Secure cluster communication — Self signed certificates — Testing & example

To generate your own self-signed certificates for testing, you must first create a certificate authority.

**Note**
For this example, whenever you are asked for input, feel free to just press enter and leave the defaults there.

```shell
openssl req -config <(printf "[req]\ndistinguished_name=dn\n[dn]\n[ext]\nbasicConstraints=CA:TRUE,pathlen:0") -new -newkey rsa:2048 -nodes -subj "/C=DE/O=Test/OU=Test/ST=BE/CN=cluster.local" -x509 -extensions ext -keyout ca.key -out ca.pem
```

Once we have our certificate authority, we can now generate certificates for each node. Let's say we have a cluster of three nodes, `A`, `B`, and `C`.

Take the following steps:

1. Generate a private key for each node:

```shell
openssl genpkey -out nodeA.key -algorithm RSA -pkeyopt rsa_keygen_bits:2048
openssl genpkey -out nodeB.key -algorithm RSA -pkeyopt rsa_keygen_bits:2048
openssl genpkey -out nodeC.key -algorithm RSA -pkeyopt rsa_keygen_bits:2048
```

**Note**

Generating a private key using RSA and `openssl` will generate a PKCS8 private key by default.

2. Create a certificate signing request (CSR) for each as well:

```shell
openssl req -new -key nodeA.key -out nodeA.csr
openssl req -new -key nodeB.key -out nodeB.csr
openssl req -new -key nodeC.key -out nodeC.csr
```

3. Create the final certificates for each node:

```shell
openssl x509 -req -days 365 -in nodeA.csr -CA ca.pem -CAkey ca.key -set_serial 01 -extfile <(printf "subjectAltName = IP.1:127.0.0.1") -out nodeA.pem
openssl x509 -req -days 365 -in nodeB.csr -CA ca.pem -CAkey ca.key -set_serial 01 -extfile <(printf "subjectAltName = IP.1:127.0.0.1") -out nodeB.pem
openssl x509 -req -days 365 -in nodeC.csr -CA ca.pem -CAkey ca.key -set_serial 01 -extfile <(printf "subjectAltName = IP.1:127.0.0.1") -out nodeC.pem
```

Make sure to replace `IP.1:127.0.0.1` with the advertised host of the broker. If it's an IP address, then keep the `IP.1` prefix. If it's a hostname/DNS entry, then you can write it out as `DNS.1:advertisedHost`. To be flexible, you can also use a wildcard host. For example, if you're deploying in Kubernetes, you could use `subjectAltName = DNS.1:*.cluster.local"`. You can also omit the whole `-extfile` parameter if you do not wish to use hostname verification at all.

4. Create the certificate chain so that each node is able to verify the identity of the others:

```shell
cat nodeA.pem ca.pem > chainNodeA.pem
cat nodeB.pem ca.pem > chainNodeB.pem
cat nodeC.pem ca.pem > chainNodeC.pem
```

5. You can now configure each node using its respective final `chainNode*.pem` file and `node*.key` file. For example, if node `A` was a broker:

```yaml
security:
  enabled: true
  certificateChainPath: chainNodeA.pem
  privateKeyPath: nodeA.key
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/secure-cluster-communication
