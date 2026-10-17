# Job workers — Object-oriented handlers

```php
final class PaymentJobHandler implements JobHandler
{
    public function handle(ActivatedJobResult $job, JobActionClient $action): ?array
    {
        $variables = $job->getVariables();
        if (!isset($variables['paymentId'])) {
            $action->error('MISSING_PAYMENT_ID', 'The payment job has no payment id.');
            return null;
        }

        return ['paymentStatus' => 'approved'];
    }
}

function object_job_handler(CamundaClient $client): void
{
    $worker = $client->createJobWorker(new JobWorkerOptions(type: 'process-payment'));
    $worker->run(new PaymentJobHandler());
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/php-sdk/job-workers
