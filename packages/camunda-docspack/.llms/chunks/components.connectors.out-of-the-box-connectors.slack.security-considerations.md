# Slack connector — Security considerations

### Integrity

Each Slack message is signed with HMAC using a Slack signing key. The **Slack inbound connector** verifies HMAC integrity
for every incoming request. Read more about signing secrets in the
[Slack documentation](https://api.slack.com/authentication/verifying-requests-from-slack).


## Appendix

### Slack `app_mention` event example

```
POST https://<base URL>/inbound/<webhook ID>

connection: close
content-type: application/json
content-length: 429
x-slack-request-timestamp: 1687791117
x-slack-signature: v0=aaaaaaaabbbbbbbbcccccccddddddeeeeeeffffffff
accept: application/json,*/*
accept-encoding: gzip,deflate
user-agent: Slackbot 1.0 (+https://api.slack.com/robots)
host: <base URL>

{
   "token": "XXXXXXXX",
   "team_id": "XXXXXXXX",
   "api_app_id": "XXXXXXXX",
   "event": {
      "client_msg_id": "ffb7ded2-6f55-468d-926f-cad3195c8056",
      "type": "app_mention",
      "text": "<@XXXXXXXX> say hello",
      "user": "XXXXXXXX",
      "ts": "11111111.2222222",
      "blocks": [
         {
            "type": "rich_text",
            "block_id": "rarsi",
            "elements": [
               {
                  "type": "rich_text_section",
                  "elements": [
                     {
                        "type": "user",
                        "user_id": "XXXXXXXX"
                     },
                     {
                        "type": "text",
                        "text": " say hello"
                     }
                  ]
               }
            ]
         }
      ],
      "team": "XXXXXXXX",
      "thread_ts": "1687864866.335329",
      "parent_user_id": "XXXXXXXX",
      "channel": "XXXXXXXX",
      "event_ts": "1687866358.496959"
   },
   "type": "event_callback",
   "event_id": "XXXXXXXX",
   "event_time": 1687866358,
   "authorizations": [
      {
         "enterprise_id": null,
         "team_id": "XXXXXXXX",
         "user_id": "XXXXXXXX",
         "is_bot": true,
         "is_enterprise_install": false
      }
   ],
   "is_ext_shared_channel": false,
   "event_context": "XXXXXXXX"
}
```

### Slack slash command example

Given the following command is executed: `/test123 test`.

```
POST https://<base URL>/inbound/<webhook ID>

connection: close
content-type: application/x-www-form-urlencoded
content-length: 429
x-slack-request-timestamp: 1687792480
x-slack-signature: v0=aaaaaaaabbbbbbbbcccccccddddddeeeeeeffffffff
accept: application/json,*/*
accept-encoding: gzip,deflate
user-agent: Slackbot 1.0 (+https://api.slack.com/robots)
host: <base URL>

token=qQqQqQqQqQqQqQqQqQ
&team_id=T05ABCDEFG
&team_domain=yourdomain
&channel_id=C05QQQQQQ
&channel_name=channel1
&user_id=U05AAAAAAA
&user_name=your.user
&command=%2Ftest123
&text=test
&api_app_id=A05DDDDDDD
&is_enterprise_install=false
&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FXXXXXXXXX%2FYYYYYYYYYYY%2FZZZZZZZZ
&trigger_id=111111111.222222222.33333333
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/slack
