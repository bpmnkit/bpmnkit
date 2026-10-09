# Hugging Face connector — Make your Hugging Face connector executable

To work with the **Hugging Face connector**, fill all mandatory fields.


## Authentication

Fill the **Hugging Face API key** field with a valid Hugging Face API key.

### Create a new connector secret

Keep your **API key** safe and avoid exposing it in the BPMN `xml` file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets).
2. Name your secret (for example, `HUGGING_FACE_SECRET`) so you can reference it later in the connector.


## Payload

In the **Model** field, enter a model name you wish to use in your BPMN process, for example, `gpt2` if you wish to use
the [GPT2 model](https://huggingface.co/openai-community/gpt2).

In the **Input** field, enter input parameters for your model, for example, `{"inputs":"What is the Capital of Germany?"}`.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/hugging-face
