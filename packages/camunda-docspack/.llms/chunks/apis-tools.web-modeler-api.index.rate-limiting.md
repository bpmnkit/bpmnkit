# Web Modeler API — Rate limiting

In SaaS, the Web Modeler API uses rate limiting to control traffic.
The limit is 240 requests per minute.
Surpassing this limit will result into a `HTTP 429 Too Many Requests` response.

On Self-Managed instances no limits are enforced.


## FAQ

### What is the difference between _simplePath_ and _canonicalPath_?

In Web Modeler you can have multiple files with the same name, multiple folders with the same name, and even multiple projects with the same name. Internally, duplicate names are disambiguated by unique IDs.

The API gives you access to the names, as well as the IDs. For example, when requesting a file you will get the following information:

- **simplePath** contains the human-readable path. This path may be ambiguous or may have ambiguous elements (e.g. folders) in it.
- **canonicalPath** contains the unique path. It is a list of **PathElementDto** objects which contain the ID and the name of the element.

Internally, the IDs are what matters. You can rename files or move files between folders and projects and the ID will stay the same.

---
Source: https://docs.camunda.io/docs/next/apis-tools/web-modeler-api/index
