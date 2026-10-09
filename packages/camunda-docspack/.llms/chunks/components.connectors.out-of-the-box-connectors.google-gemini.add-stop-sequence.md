# Google Gemini connector — Add stop sequence

A stop sequence is a series of characters (including spaces) that stops response generation if encountered by the model.

The stop sequence should be inserted as a string list.

For example:

```feel
= ["text 1", "text 2"]
```


## Temperature

The **Temperature** controls the randomness in token selection.

- A lower temperature is good when you expect a true or correct response. A temperature of `0` means the highest probability token is usually selected.
- A higher temperature can lead to diverse or unexpected results. Some models have a higher temperature max to encourage more random responses.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-gemini
