# iframe — Security advisory

When configuring iframes, it's essential to understand the security implications, especially if you are not certain of what you'll be rendering ahead of time.

- **URL Caution**: Be very careful with the URLs loaded into the iframe. This isn't much of a concern if you just statically define a site, but if you are using links from say, some data a user submitted earlier in your process, it is critical that those are validated prior to being rendered in the iframe.

- **Script Execution**: Enabling script execution can expose users to cross-site scripting (XSS) attacks if the content source is not secure. Limit this functionality to trusted, verified sources.

- **Allow Same Origin**: This allows the iframe to access cookies, local storage, and DOM storage. Enabling this for an untrusted source can lead to data leaks or other security breaches.

- **Camera/Microphone Access and Geolocation**: These features should only be enabled for sites where they are absolutely necessary and trusted. Unauthorized access to these can severely compromise user privacy.

- **Top-Level Navigation**: This allows the iframe to redirect the parent page. Be cautious, as malicious sites can abuse this to redirect users to harmful websites.

- **Modal Windows/Popups**: While useful, these can be exploited for phishing attacks or unwanted advertising. Only enable for trusted content.

You should adopt a allowlisting approach to iframe configuration. This means **only enabling the bare minimum functionality** that you need for your use-case, which ensures the attack surface is kept as low as possible.

Additionally, if you are rendering an external link you don't have control over, ensure that you specify what that link should look like and **validate it** somewhere in your process prior to rendering it. If the link could be anything, then you should not render it in this component.

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-iframe
