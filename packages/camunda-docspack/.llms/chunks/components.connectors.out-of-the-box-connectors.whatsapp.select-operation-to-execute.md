# WhatsApp connector — Select operation to execute

You can select one of the following operations from the **Message type** dropdown.

### Plain text

When this option is selected, write any arbitrary text in the **Message text** field. This message will be sent to the target recipient.

### Message template

When this option is selected, it is implied that you already have an approved WhatsApp message template.
Read more bout message templates at the [official page](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines/).

1. In the field **Template name**, set the name of your WhatsApp template. For example, **my_delivery_scheduled_template**.
2. In the field **Template language code**, specify the language code of your template. For example, **en_US**.
3. In the field **Header variables**, set the values for your variables only if the header has any. For example, `{"type": "text","text": "My header param"}`.
4. In the field **Body variables**, set the values for your variables only if the body has any. For example, `{"type": "text","text": "My body param"}`.

See the [official Meta guide](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates/) for more information and examples.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/whatsapp
