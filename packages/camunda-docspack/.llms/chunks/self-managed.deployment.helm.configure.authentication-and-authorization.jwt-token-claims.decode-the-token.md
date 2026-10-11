# JWT token claims reference — Decode the token

Decode the JWT to inspect its claims.

### Command line (Linux/macOS)

```bash
echo "<access-token>" | jq -R 'split(".")[1] | gsub("-";"+") | gsub("_";"/") | @base64d | fromjson'
```

JWT payloads use unpadded base64url encoding. The command converts the characters `-` and `_` to `+` and `/` before decoding, because a plain `base64 -d` can fail on JWT payloads.

### Online tools

You can also use online tools such as [jwt.io](https://jwt.io) by pasting the token value.

**Caution: Security warning**
Only decode tokens from **test or development environments** using online tools.  
Never paste production tokens or tokens containing sensitive information into third-party sites, as they may be logged or leaked.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/jwt-token-claims
