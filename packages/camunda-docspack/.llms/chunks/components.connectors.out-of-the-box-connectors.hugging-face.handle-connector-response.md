# Hugging Face connector — Handle connector response

The **Hugging Face connector** is a protocol connector, meaning it is built on top of the **HTTP REST connector**. Therefore,
handling response is still applicable [as described](https://docs.camunda.io/docs/next/components/connectors/protocol/rest#response).


## Usage example

Let's assume you want to use the [BART (large-sized model), fine-tuned on CNN Daily Mail](https://huggingface.co/facebook/bart-large-cnn) model,
and created the `HUGGING_FACE_SECRET` secret containing your Hugging Face API key.

Consider the following input:

- **Hugging Face API key**: `{{secrets.HUGGING_FACE_SECRET}}`
- **Model**: `facebook/bart-large-cnn`
- **Input**:

```json
{
  "inputs": "Java is a high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible. It is a general-purpose programming language intended to let programmers write once, run anywhere (WORA), meaning that compiled Java code can run on all platforms that support Java without the need to recompile. Java applications are typically compiled to bytecode that can run on any Java virtual machine (JVM) regardless of the underlying computer architecture. The syntax of Java is similar to C and C++, but has fewer low-level facilities than either of them. The Java runtime provides dynamic capabilities (such as reflection and runtime code modification) that are typically not available in traditional compiled languages. As of March 2024, Java 22 is the latest version. Java 8, 11, 17, and 21 are previous LTS versions still officially supported.",
  "parameters": { "max_length": 75, "temperature": 10 },
  "options": { "use_cache": "false" }
}
```

- **Result variable**: `myHuggingFaceResponse`.

In the `myHuggingFaceResponse` you will find the following result:

```json
{
   "status":200,
   "headers":{
...
   },
   "body":[
      {
         "summary_text":" Java is a high-level, class-based, object-oriented programming language. It is intended to let programmers write once, run anywhere. Java applications are typically compiled to bytecode that can run on any Java virtual machine (JVM) regardless of the underlying computer architecture. As of March 2024, Java 22 is the latest version."
      }
   ]
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/hugging-face
