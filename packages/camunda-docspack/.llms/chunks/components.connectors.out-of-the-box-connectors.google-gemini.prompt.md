# Google Gemini connector — Prompt

Enter a prompt as a FEEL expression, providing text and media.

- To provide text to Gemini, your expression should contain key _"text"_ and text data. For example, _"text"_ : _"your text"_
- To provide media to Gemini, your expression should contain key _"mime"_ and mime type text, and key _"uri"_ and media URI. For example, _"mime"_: _"mime type"_, _"uri"_: _"your URI"_.

For example:

```feel
= [{"text": "who is this video about"},
{"mime": "video/*", "uri": "https://youtu.be/..."}]
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-gemini
