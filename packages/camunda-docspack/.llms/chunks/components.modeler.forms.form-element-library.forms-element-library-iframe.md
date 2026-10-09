# iframe

Learn about the iframe form element to embed external content.

This is an element allowing the user to embed external content via an iframe.

**Note**

Every iframe component is a sandbox. This means that the content of the iframe is not able to access the parent page, cookies, browser storage, and others. [Learn more about sandbox iframes](https://www.w3schools.com/tags/att_iframe_sandbox.asp).


## Configurable properties

- **Title**: Label displayed on top of the iframe and as the accessible title. Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax).
- **URL**: Enter an HTTPS URL to a source. Can either be an [expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), plain text, or [templating syntax](https://docs.camunda.io/docs/next/components/modeler/forms/configuration/forms-config-templating-syntax). Ensure the URL is safe as it might impose security risks. Not all external sources can be displayed in the iframe. Read more about it in [the X-FRAME-OPTIONS documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options).
- **Height**: Defines the height of the iframe. Defined as number of pixels.
- **Security attributes**: Allow the iframe's sandbox more access to various functionality of the browser, at the cost of security.
  - **Script execution**: Enables script running, essential for interactive websites.
  - **Allow same origin**: Controls the same-origin policy for the iframe, impacting access to data like cookies, local storage, and DOM storage.
  - **Open in fullscreen**: Allows the content of the iframe to request fullscreen mode.
  - **Geolocation**: Grants or denies access to geolocation services.
  - **Camera/Microphone access**: Required for functionality which makes use of the camera/microphone. You may need to allow it through a browser prompt as well.
  - **Forms submission**: Enables the submission of forms within the iframe.
  - **Open modal windows/popups**: Permits the iframe to open modal windows/popups.
  - **Top level navigation**: Gives the iframe permission to change the URL of the parent page, navigating away entirely from it.
  - **Storage access by user**: Controls access of local storage based on user interactions, may be expected in addition to allow same origin on certain browsers for functionality depending on storage.
- **Hide if**: [Expression](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction) to hide the iframe.
- **Columns**: Space the field will use inside its row. **Auto** means it will automatically adjust to available space in the row. Read more about the underlying grid layout in the [Carbon Grid documentation](https://carbondesignsystem.com/elements/2x-grid/overview/).

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-iframe
