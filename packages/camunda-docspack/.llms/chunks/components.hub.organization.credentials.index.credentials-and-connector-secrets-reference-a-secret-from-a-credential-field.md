# Manage credentials — Credentials and connector secrets — Reference a secret from a credential field

To reference a secret from a credential field, enter `camunda.secrets.` followed by the secret key as the whole value of the field. For example, reference a secret with the key `AWS_SECRET_KEY` as follows:

```
camunda.secrets.AWS_SECRET_KEY
```

A secret key can contain letters, digits, underscores, and hyphens. The key ends at the first character outside that set, so a key cannot contain a period.

A reference is recognized at the start of a value, or directly after a character that is not a letter, digit, underscore, or period. Anywhere else, `camunda.secrets.` is part of a longer word:

| Field value                                      | How it is read                                                                                                                                                                                      |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `camunda.secrets.AWS_SECRET_KEY`                 | A reference to the secret `AWS_SECRET_KEY`.                                                                                                                                                         |
| `(camunda.secrets.AWS_SECRET_KEY)`               | A reference to the secret `AWS_SECRET_KEY`. The reference is recognized after the opening parenthesis, and the key ends at the closing parenthesis, because neither character can be part of a key. |
| `foo.camunda.secrets.AWS_SECRET_KEY`             | Not a reference, because `camunda.secrets.` is in the middle of a word. The value is stored and sent as plain text.                                                                                 |
| `camunda.secrets.camunda.secrets.AWS_SECRET_KEY` | A reference to a secret with the key `camunda`, because the key ends at the next period.                                                                                                            |
| `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`       | Plain text. Camunda Hub warns you, and stores the value as you entered it.                                                                                                                          |

**Note**
Credential fields use `camunda.secrets.MY_API_KEY`, without braces. This is not the same as the `{{secrets.MY_API_KEY}}` syntax you use in a [connector field](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#using-secrets). Use `camunda.secrets.` inside a credential, and `{{secrets.}}` in connector fields that support secrets.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/credentials/index
