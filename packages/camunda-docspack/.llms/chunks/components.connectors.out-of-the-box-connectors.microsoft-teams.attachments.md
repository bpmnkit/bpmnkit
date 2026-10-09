# Microsoft Teams connector — Attachments

The Microsoft Teams connector supports sending attachments, such as Adaptive Cards, when sending messages to channels or chats. With this feature, you can create rich, interactive messages with structured content.

**Note**
Attachments are only available when the **Content Type** is set to **HTML**. They are not supported with the **Text** body type because Microsoft Teams cannot render attachment tags in plain text messages. When the body type is set to **Text**, the attachments field is hidden and unavailable.

### Attachment fields

Each attachment requires the following fields:

- `id` (`string`): A unique identifier for the attachment, for example a UUID like `16677edaada34773b62bca2e77ba059b`. This ID is used to reference the card in the message body via `<attachment id="..."></attachment>` HTML tags.
- `contentType` (`string`): The media type of the attachment. The most common value is `application/vnd.microsoft.card.adaptive` for Adaptive Cards. Other supported Microsoft Bot Framework card content types include `application/vnd.microsoft.card.hero`, `application/vnd.microsoft.card.thumbnail`, and `application/vnd.microsoft.card.receipt`.
- `content` (`string`): The JSON payload of the card, provided as a stringified JSON string. For Adaptive Cards, you can [design your card visually](https://adaptivecards.microsoft.com/designer), then copy the resulting JSON and stringify it by escaping quotes and removing newlines before pasting it into this field. If using a FEEL expression, the JSON object can be passed directly.

### Auto-appended attachment tags

If you do not manually include `<attachment id="..."></attachment>` tags in your HTML message body, the connector automatically appends them for each attachment. If the tags are already present in the body, the connector does not modify anything.

### Example

The following example shows how to send a message with an Adaptive Card attachment:

**Content (HTML body):**

```html
Hello! Here is an important update:
<attachment id="16677edaada34773b62bca2e77ba059b"></attachment>
```

**Attachments (FEEL expression):**

```feel
= [
  {
    "id": "16677edaada34773b62bca2e77ba059b",
    "contentType": "application/vnd.microsoft.card.adaptive",
    "content": "{\"type\":\"AdaptiveCard\",\"$schema\":\"http://adaptivecards.io/schemas/adaptive-card.json\",\"version\":\"1.5\",\"body\":[{\"type\":\"TextBlock\",\"text\":\"Hello from Camunda!\",\"weight\":\"Bolder\",\"size\":\"Large\"},{\"type\":\"TextBlock\",\"text\":\"This is an Adaptive Card sent via the Microsoft Teams connector.\",\"wrap\":true}],\"actions\":[{\"type\":\"Action.OpenUrl\",\"title\":\"Learn More\",\"url\":\"https://camunda.com\"}]}"
  }
]
```

**Attachments (stringified JSON for direct input):**

```json
[
  {
    "id": "16677edaada34773b62bca2e77ba059b",
    "contentType": "application/vnd.microsoft.card.adaptive",
    "content": "{\"type\":\"AdaptiveCard\",\"$schema\":\"http://adaptivecards.io/schemas/adaptive-card.json\",\"version\":\"1.5\",\"body\":[{\"type\":\"TextBlock\",\"text\":\"Hello from Camunda!\",\"weight\":\"Bolder\",\"size\":\"Large\"},{\"type\":\"TextBlock\",\"text\":\"This is an Adaptive Card sent via the Microsoft Teams connector.\",\"wrap\":true}],\"actions\":[{\"type\":\"Action.OpenUrl\",\"title\":\"Learn More\",\"url\":\"https://camunda.com\"}]}"
  }
]
```

**Tip**
To create an Adaptive Card, use the [Adaptive Cards Designer](https://adaptivecards.microsoft.com/designer) to visually build your card. Once complete, copy the JSON from the **Card Payload Editor** panel, then stringify it by escaping quotes and removing newlines before using it in the `content` field.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/microsoft-teams
