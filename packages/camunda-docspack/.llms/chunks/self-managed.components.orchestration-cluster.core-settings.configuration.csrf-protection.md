# CSRF protection

Cross-Site Request Forgery (CSRF) is a type of malicious exploit where unauthorized commands are transmitted from a user that the web application trusts.

Cross-Site Request Forgery (CSRF) is a type of malicious exploit where unauthorized commands are
transmitted from a user that the web application trusts. In a CSRF attack, an attacker tricks a victim's
browser into making unwanted requests to a web application where the victim is authenticated.

For a comprehensive understanding of CSRF attacks and prevention methods, refer to the
[MDN Web Docs on CSRF](https://developer.mozilla.org/en-US/docs/Glossary/CSRF).

Review the configuration details in the [properties documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundasecuritycsrf).

**Caution**
Disabling CSRF protection is not recommended for production environments as it leaves your application vulnerable to cross-site request forgery attacks.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/csrf-protection
