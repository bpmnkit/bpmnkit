# Google Drive connector — Appendix & FAQ — What Google API does the Google Drive connector use to create a file from template?

The **Google Drive connector** uses the Google Drive [`Files:Copy`](https://developers.google.com/drive/api/v3/reference/files/copy) API endpoint to copy an original template. Afterwards, the **Google Drive connector** utilizes Google Docs [Merge](https://developers.google.com/docs/api/how-tos/merge) approach via [`Documents:BatchUpdate`](https://developers.google.com/docs/api/reference/rest/v1/documents/batchUpdate) Google Docs API method.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/googledrive
