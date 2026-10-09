# Helm chart dual-region operational procedure — Procedure — OpenShift

Retrieve the name of the bucket from the [verify the pre-requisites step of OpenShift Dual-region](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region#verify-the-pre-requisites) step, it should be referenced as the `AWS_ES_BUCKET_NAME` variable.

   Export it:

   ```bash
   export S3_BUCKET_NAME="$AWS_ES_BUCKET_NAME"
   ```

   
   

2. Retrieve the Elasticsearch password, and configure the backup endpoint in the surviving namespace `CAMUNDA_NAMESPACE_SURVIVING`:

   ```bash
   ELASTIC_POD=$(kubectl --context $CLUSTER_SURVIVING get pod --selector=elasticsearch.k8s.elastic.co/cluster-name=elasticsearch -o jsonpath='{.items[0].metadata.name}' -n $CAMUNDA_NAMESPACE_SURVIVING)
   ES_PASSWORD=$(kubectl --context $CLUSTER_SURVIVING get secret elasticsearch-es-elastic-user -n $CAMUNDA_NAMESPACE_SURVIVING -o jsonpath='{.data.elastic}' | base64 -d)
   kubectl --context $CLUSTER_SURVIVING exec -n $CAMUNDA_NAMESPACE_SURVIVING -it $ELASTIC_POD -c elasticsearch -- \
    curl -u "elastic:$ES_PASSWORD" -XPUT 'http://localhost:9200/_snapshot/camunda_backup' \
    -H 'Content-Type: application/json' \
    -d'
   {
   "type": "s3",
   "settings": {
      "bucket": "'$S3_BUCKET_NAME'",
      "client": "camunda",
      "base_path": "backups"
   }
   }
   '
   ```

3. Create an Elasticsearch backup in the surviving namespace `CAMUNDA_NAMESPACE_SURVIVING`. Depending on the amount of data, this operation will take a while to complete. It also explicitly includes the global state, which is required during restore because it contains the Camunda index templates.

   ```bash
   # The backup will be called failback
   kubectl --context $CLUSTER_SURVIVING exec -n $CAMUNDA_NAMESPACE_SURVIVING -it $ELASTIC_POD -c elasticsearch -- \
    curl -u "elastic:$ES_PASSWORD" -XPUT 'http://localhost:9200/_snapshot/camunda_backup/failback?wait_for_completion=true' \
    -H 'Content-Type: application/json' \
    -d '{"include_global_state": true}'
   ```

4. Verify the backup has been completed successfully by checking all backups and ensuring the `state` is `SUCCESS`:

   ```bash
   kubectl --context $CLUSTER_SURVIVING exec -n $CAMUNDA_NAMESPACE_SURVIVING -it $ELASTIC_POD -c elasticsearch -- curl -u "elastic:$ES_PASSWORD" -XGET 'http://localhost:9200/_snapshot/camunda_backup/_all'
   ```

   
   Example output
   

   ```json
   {
     "snapshots": [
       {
         "snapshot": "failback",
         "uuid": "1S_C05K0RjqFyWMfjSKI_A",
         "repository": "camunda_backup",
         "version_id": 8525000,
         "version": "8.18.0",
         "indices": [
           "camunda-usage-metric-tu-8.8.0_",
           "tasklist-metric-8.3.0_",
           "camunda-mapping-rule-8.8.0_",
           "operate-job-8.6.0_",
           "camunda-user-8.8.0_",
           "camunda-usage-metric-8.8.0_",
           "operate-import-position-8.3.0_",
           "camunda-correlated-message-subscription-8.8.0_",
           "operate-variable-8.3.0_",
           "operate-message-8.5.0_",
           "operate-decision-requirements-8.3.0_",
           "operate-process-8.3.0_",
           "camunda-authorization-8.8.0_",
           "operate-decision-instance-8.3.0_",
           "operate-list-view-8.3.0_",
           "camunda-group-8.8.0_",
           "operate-batch-operation-1.0.0_",
           "tasklist-form-8.4.0_",
           "tasklist-task-variable-8.3.0_",
           "operate-metric-8.3.0_",
           "camunda-web-session-8.8.0_",
           "operate-sequence-flow-8.3.0_",
           "tasklist-task-8.8.0_",
           "tasklist-draft-task-variable-8.3.0_",
           "operate-flownode-instance-8.3.1_",
           "operate-event-8.3.0_",
           "tasklist-import-position-8.2.0_",
           "operate-decision-8.3.0_",
           "operate-incident-8.3.1_",
           "operate-operation-8.4.1_",
           "camunda-role-8.8.0_",
           "operate-post-importer-queue-8.3.0_",
           "camunda-tenant-8.8.0_"
         ],
         "data_streams": [],
         "include_global_state": true,
         "state": "SUCCESS",
         "start_time": "2025-09-29T11:38:18.285Z",
         "start_time_in_millis": 1759145898285,
         "end_time": "2025-09-29T11:38:19.292Z",
         "end_time_in_millis": 1759145899292,
         "duration_in_millis": 1007,
         "failures": [],
         "shards": {
           "total": 33,
           "failed": 0,
           "successful": 33
         },
         "feature_states": []
       }
     ],
     "total": 1,
     "remaining": 0
   }
   ```

   
   

5. Configure Elasticsearch backup endpoint in the new region namespace `CAMUNDA_NAMESPACE_RECREATED`. It's essential to only do this step now as otherwise it won't see the backup:

   ```bash
   ELASTIC_POD=$(kubectl --context $CLUSTER_RECREATED get pod --selector=elasticsearch.k8s.elastic.co/cluster-name=elasticsearch -o jsonpath='{.items[0].metadata.name}' -n $CAMUNDA_NAMESPACE_RECREATED)
   ES_PASSWORD=$(kubectl --context $CLUSTER_RECREATED get secret elasticsearch-es-elastic-user -n $CAMUNDA_NAMESPACE_RECREATED -o jsonpath='{.data.elastic}' | base64 -d)
   kubectl --context $CLUSTER_RECREATED exec -n $CAMUNDA_NAMESPACE_RECREATED -it $ELASTIC_POD -c elasticsearch -- curl -u "elastic:$ES_PASSWORD" -XPUT 'http://localhost:9200/_snapshot/camunda_backup' -H 'Content-Type: application/json' -d'
   {
   "type": "s3",
   "settings": {
      "bucket": "'$S3_BUCKET_NAME'",
      "client": "camunda",
      "base_path": "backups"
   }
   }
   '
   ```

6. Verify that the backup can be found in the shared S3 bucket:

   ```bash
   kubectl --context $CLUSTER_RECREATED exec -n $CAMUNDA_NAMESPACE_RECREATED -it $ELASTIC_POD -c elasticsearch -- curl -u "elastic:$ES_PASSWORD" -XGET 'http://localhost:9200/_snapshot/camunda_backup/_all'
   ```

   The example output above should be the same since it's the same backup.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
