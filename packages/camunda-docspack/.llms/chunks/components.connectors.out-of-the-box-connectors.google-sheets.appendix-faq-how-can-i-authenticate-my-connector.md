# Google Sheets connector — Appendix & FAQ — How can I authenticate my connector?

The **Google Sheets connector** currently supports two methods for authentication and authorization: based on
short-lived JWT bearer token, and based on refresh token.

Google supports multiple ways to obtain both. Refer to
the [official Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2) to get up-to-date
instructions or refer to the examples below.

You also enable _Google Sheets API_ and _Google Drive API_ for every client intended to use. You can do this from
the [Google Cloud API Library](https://console.cloud.google.com/apis/library).

#### Example 1: Obtaining JWT bearer token with a service account

**Danger**
The following code snippet is for demonstration purposes only and must not be used for real production systems due to
security concerns.
For production usage, follow
the [official Google guidelines](https://developers.google.com/identity/protocols/oauth2/service-account).

Assuming you have created a service account and downloaded a JSON file with keys, run the following Python 3 snippet
that prints the JWT token in the terminal:

```python
import google.auth
import google.auth.transport.requests
from google.oauth2 import service_account
# Scopes required to execute 'create' endpoind with Google Sheets API
SCOPES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.appdata']
# File with keys
SERVICE_ACCOUNT_FILE = 'google-service-account-creds.json'
credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
auth_req = google.auth.transport.requests.Request()
credentials.refresh(auth_req)
# Print token
print(credentials.token)
```

#### Example 2: Obtaining bearer and refresh tokens with OAuth client

**Danger**
The following code snippet is for demonstration purposes only and must not be used for real production systems due to
security concerns.
For production usage, follow
the [official Google guidelines](https://developers.google.com/identity/protocols/oauth2/web-server).

Assuming you have created an OAuth client, you can download key files from the
Google [Console](https://console.cloud.google.com/apis/credentials). Run the following Python 3 snippet that prints the
refresh token in the terminal:

```python
from google_auth_oauthlib.flow import InstalledAppFlow
import pprint

SCOPES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']
OAUTH_KEYS = './oauth-keys.json' # path to your file with OAuth credentials

def main():
    flow = InstalledAppFlow.from_client_secrets_file(OAUTH_KEYS, SCOPES)
    creds = flow.run_local_server(port=54948)
    pprint.pprint(vars(creds))

if __name__ == "__main__":
    main()
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-sheets
