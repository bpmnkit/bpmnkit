# SOAP connector — Connection

Enter your SOAP service URL in the field **Service URL**, for example `https://myservice.com/service/MyService.wso`.


## Authentication

Select the authentication type from the **Authentication** dropdown.

### None

Use **None** if the SOAP service does not require authentication.

### WSS username token

Use **WSS username token** in the **Authentication** dropdown when the requested SOAP endpoint requires
[username token extension](https://docs.oasis-open.org/wss/v1.1/wss-v1.1-spec-pr-UsernameTokenProfile-01.htm#_Toc104276211).

Enter **Username**, **Password**, and indicate if the password is encoded.

**Note**
The **SOAP connector** currently supports only `SHA-1` password encoding.

### WSS signature

Use the **WSS signature** in the **Authentication** dropdown when the requested SOAP endpoint requires a message to be
cryptographically signed with a [signature](http://docs.oasis-open.org/wss-m/wss/v1.1.1/cs01/wss-SOAPMessageSecurity-v1.1.1-cs01.html#_Toc307407954).

Enter all necessary fields according to your service specification.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/soap
