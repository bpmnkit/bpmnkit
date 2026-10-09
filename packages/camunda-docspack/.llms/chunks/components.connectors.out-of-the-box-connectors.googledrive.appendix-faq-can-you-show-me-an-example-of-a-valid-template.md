# Google Drive connector — Appendix & FAQ — Can you show me an example of a valid template?

Certainly! Here is an example of a valid template:

```text
        {{CompanyName}} confidential.
{{DocumentDate}}

{{RecipientFullName}}
{{RecipientAddress}}

Dear {{RecipientShortName}}!

We are pleased to inform you that your application {{ApplicationNumber}} has been approved.

Sincerely,
{{SigneeName}}, Executive Director

```

Now, in the **Template variables** field we can apply the following FEEL JSON object which must be compatible with the Google Docs Requests API:

```
= {
  "requests":[
    {
      "replaceAllText":{
        "containsText":{
          "text":"{{DocumentDate}}",
          "matchCase":"true"
        },
        "replaceText":today()
      }
    },
    {
      "replaceAllText":{
        "containsText":{
          "text":"{{RecipientFullName}}",
          "matchCase":"true"
        },
        "replaceText":"John W. Doe"
      }
    },
    {
      "replaceAllText":{
        "containsText":{
          "text":"{{RecipientAddress}}",
          "matchCase":"true"
        },
        "replaceText":"Zweibrückenstraße 1845, 80000 Munich"
      }
    },
    {
      "replaceAllText":{
        "containsText":{
          "text":"{{RecipientShortName}}",
          "matchCase":"true"
        },
        "replaceText":"Mr. Doe"
      }
    },
    {
      "replaceAllText":{
        "containsText":{
          "text":"{{ApplicationNumber}}",
          "matchCase":"true"
        },
        "replaceText":"0123456789"
      }
    },
    {
      "replaceAllText":{
        "containsText":{
          "text":"{{SigneeName}}",
          "matchCase":"true"
        },
        "replaceText":"Jane T. Doe"
      }
    },
    {
      "replaceAllText":{
        "containsText":{
          "text":"{{CompanyName}}",
          "matchCase":"true"
        },
        "replaceText":"Good Company Inc."
      }
    }
  ]
}
```

The result should be as follows:

```text
        Good Company inc. confidential.
2022-08-10

John W. Doe
Zweibrückenstraße 1845, 80000 Munich

Dear Mr. Doe!

We are pleased to inform you that your application 0123456789 has been approved.

Sincerely,
Jane T. Doe, Executive Director

```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/googledrive
