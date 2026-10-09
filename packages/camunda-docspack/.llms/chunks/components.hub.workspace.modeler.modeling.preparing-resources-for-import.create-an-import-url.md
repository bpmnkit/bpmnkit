# Prepare resources for import into Camunda Hub — Create an import URL

1. Get the public URL to the resource.

For GitHub-hosted resources, see first [Get public URLs from GitHub](#get-public-urls-from-github).

2. Form the Camunda Hub URL like this:

```
<Camunda Hub host>/import/resources?source=<raw file URL>
```

3. To add more resources, add a comma after the last URL and paste the next URL:

```
<Camunda Hub host>/import/resources?source=<raw file URL 1>,<raw file URL 2>
```

4. (Optional) Add a title. When the resources are treated as a project, this will be the project's name.

```
<Camunda Hub host>/import/resources?title=<project name>&source=<raw file URL 1>,<raw file URL 2>
```

### Get public URLs from GitHub

You can host your resources on any public-facing website that allows direct access. See [Hosting requirements](#hosting-requirements) for more details.

### Individual resource URL

To get a public URL for a single resource:

1. Open the resource in your public GitHub repository.
2. Click **Raw**.
3. Copy the URL from your browser's address bar.

**Important**
The URL from step 3 is a direct link that Camunda Hub can access without redirects.

### Packaged resources URL

To get a public URL for packaged resources into a `.zip` file:

1. Open the `.zip` file in your publicly accessible GitHub repository.
2. In the file view, right‑click the **Raw** button in the top right.
3. Click **Copy link**.
4. In a text editor:
   - Replace `github.com` with `raw.githubusercontent.com`.
   - Remove the `/raw` segment that appears once in the URL after the repository name.
   - Leave everything else unchanged.

You can automate this transformation as follows:

```bash
GITHUB_RAW_ZIP_URL=your_original_url

echo "$GITHUB_RAW_ZIP_URL" \
  | sed -E 's#https://github.com/([^/]+)/([^/]+)/raw/(.+)#https://raw.githubusercontent.com/\1/\2/\3#'
```

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/preparing-resources-for-import
