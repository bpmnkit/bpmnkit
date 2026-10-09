# Amazon Simple Notification Service connector — Appendix

### Amazon SNS Subscription message example

```
POST https://<base URL>/inbound/<subscription ID>

connection: close
accept-encoding: gzip,deflate
user-agent: Amazon Simple Notification Service Agent
host: <base URL>
content-length: 9999
content-type: text/plain; charset=UTF-8
x-amz-sns-topic-arn: arn:aws:sns:eu-central-1:1234567890:SNSWebhook
x-amz-sns-message-id: b9b4574f-b4ab-4c03-ac14-a3145896747f
x-amz-sns-message-type: SubscriptionConfirmation

{
  "Type": "SubscriptionConfirmation",
  "MessageId": "b9b4574f-b4ab-4c03-ac14-a3145896747f",
  "Token": "233...18b",
  "TopicArn": "arn:aws:sns:eu-central-1:1234567890:SNSWebhook",
  "Message": "You have chosen to subscribe to the topic arn:aws:sns:eu-central-1:1234567890:SNSWebhook.\nTo confirm the subscription, visit the SubscribeURL included in this message.",
  "SubscribeURL": "https://sns.eu-central-1.amazonaws.com/?Action=ConfirmSubscription&TopicArn=arn:aws:sns:eu-central-1:1234567890:SNSWebhook&Token=233...18b",
  "Timestamp": "2023-04-26T15:04:47.883Z",
  "SignatureVersion": "1",
  "Signature": "u+0i/F/+qew...zw==",
  "SigningCertURL": "https://sns.eu-central-1.amazonaws.com/SimpleNotificationService-56e67fcb41f6fec09b0196692625d385.pem"
}
```

### Amazon SNS Notification message example

```
POST https://<base URL>/inbound/<subscription ID>

connection: close
accept-encoding: gzip,deflate
user-agent: Amazon Simple Notification Service Agent
host: webhook.site
content-length: 1046
x-amzn-trace-id: Root=1-64493ecd-dcfadf2f053429acb884eee3;Sampled=1
content-type: text/plain; charset=UTF-8
x-amz-sns-subscription-arn: arn:aws:sns:eu-central-1:1234567890:SNSWebhook:4aa14ec3-a492-4a8e-8247-ea658d1aad96
x-amz-sns-topic-arn: arn:aws:sns:eu-central-1:1234567890:SNSWebhook
x-amz-sns-message-id: 2e062e6b-a527-5e68-b69b-72a8e42add60
x-amz-sns-message-type: Notification

{
  "Type" : "Notification",
  "MessageId" : "2e062e6b-a527-5e68-b69b-72a8e42add60",
  "TopicArn" : "arn:aws:sns:eu-central-1:1234567890:SNSWebhook",
  "Subject" : "Subject - test",
  "Message" : "Hello, world",
  "Timestamp" : "2023-04-26T15:10:05.479Z",
  "SignatureVersion" : "1",
  "Signature" : "a2w...A==",
  "SigningCertURL" : "https://sns.eu-central-1.amazonaws.com/SimpleNotificationService-56e67fcb41f6fec09b0196692625d385.pem",
  "UnsubscribeURL" : "https://sns.eu-central-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:eu-central-1:1234567890:SNSWebhook:4aa14ec3-a492-4a8e-8247-ea658d1aad96",
  "MessageAttributes" : {
    "attrName1" : {"Type":"String","Value":"attrVal"}
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-sns
