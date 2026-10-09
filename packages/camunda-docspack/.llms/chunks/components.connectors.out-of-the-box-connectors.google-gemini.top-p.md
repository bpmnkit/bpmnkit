# Google Gemini connector — Top-P

The **Top-P** changes how the model selects tokens for output.

- Tokens are selected from the most probable to the least probable, until the sum of their probabilities equals the top-p value.
- For example, if tokens A, B, and C have a probability of .3, .2, and .1 and the top-p value is .5, then the model will select either A or B as the next token (using temperature).
- For the least variable results, set top-P to 0.


## Functional call description

**Function calling** is a feature of Gemini models that makes it easier to get structured data outputs from generative models.

- The **Functional call description** must be provided in fell format.
- It is important that all types must be registered with capslock.

To learn more about function calling, refer to [Google function calling](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/function-calling).

For example:

```fell
[
  {
    "name": "get_exchange_rate",
    "description":"Get the exchange rate for currencies between countries",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "currency_date": {
          "type": "STRING",
          "description": "A date that must always be in YYYY-MM-DD format or the value 'latest' if a time period is not specified"
        },
        "currency_from": {
          "type": "STRING",
          "description": "The currency to convert from in ISO 4217 format"
        },
        "currency_to": {
          "type": "STRING",
          "description": "The currency to convert to in ISO 4217 format"
        }
      },
      "required":[
        "currency_date",
        "currency_from",
        "currency_to"
      ]
    }
  }
]
```

### Google authentication types

The **Google Gemini connector** currently supports two methods for authentication and authorization:

- Based on a short-lived JWT bearer token.
- Based on a refresh token.

Google supports multiple ways to obtain both types of token. Refer to the [official Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2) for current instructions, or see the examples below.

#### Example 1: Obtain JWT bearer token with a service account

**Danger**
The following code snippet is for demonstration purposes only and must not be used for real production systems due to security concerns.
For production usage, follow the [official Google guidelines](https://developers.google.com/identity/protocols/oauth2/service-account).

Assuming you have created a service account and downloaded a JSON file with keys, run the following Python 3 snippet to print the JWT token in the terminal:

```python
import google.auth
import google.auth.transport.requests
from google.oauth2 import service_account
# Scopes required to execute 'create' endpoind with Google Drive API
SCOPES = ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/generative-language.retriever']
# File with keys
SERVICE_ACCOUNT_FILE = 'google-service-account-creds.json'
credentials = service_account.Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
auth_req = google.auth.transport.requests.Request()
credentials.refresh(auth_req)
# Print token
print(credentials.token)
```

#### Example 2: Obtain bearer and refresh token with OAuth client

**Danger**
The following code snippet is for demonstration purposes only and must not be used for real production systems due to security concerns.
For production usage, follow the [official Google guidelines](https://developers.google.com/identity/protocols/oauth2/web-server).

Assuming you have created an OAuth client, you can download key files from the Google [Console](https://console.cloud.google.com/apis/credentials). Run the following Python 3 snippet to print the refresh token in the terminal:

```python
from google_auth_oauthlib.flow import InstalledAppFlow
import pprint

SCOPES = ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/generative-language.retriever']
OAUTH_KEYS = './oauth-keys.json' # path to your file with OAuth credentials

def main():
    flow = InstalledAppFlow.from_client_secrets_file(OAUTH_KEYS, SCOPES)
    creds = flow.run_local_server(port=54948)
    pprint.pprint(vars(creds))

if __name__ == "__main__":
    main()
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/google-gemini
