# Amazon Comprehend connector — 3. Configure input — Async execution fields

- **Document read mode**: Determines the text extraction actions for PDF files. For more details, refer to [document read mode](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_DocumentReaderConfig.html#comprehend-Type-DocumentReaderConfig-DocumentReadMode).
- **Document read action**: This field defines the Amazon Textract API operation that Amazon Comprehend uses to extract text from PDF files and image files. For more details, refer to [document read action](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_DocumentReaderConfig.html#comprehend-Type-DocumentReaderConfig-DocumentReadAction).
- **Analyze tables**: Returns additional information about any tables that are detected in the input document. For more details, refer to [feature types](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_DocumentReaderConfig.html#comprehend-Type-DocumentReaderConfig-FeatureTypes).
- **Analyze forms**: Returns additional information about any forms that are detected in the input document. For more details, refer to [feature types](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_DocumentReaderConfig.html#comprehend-Type-DocumentReaderConfig-FeatureTypes).
- **Inputs' S3 URI (mandatory)**: The Amazon S3 URI for the input data. For more details, refer to [S3 URI](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_InputDataConfig.html#comprehend-Type-InputDataConfig-S3Uri).
- **Input file processing mode**: Specifies how the text in an input file should be processed. For more details, refer to [InputFormat](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_InputDataConfig.html#comprehend-Type-InputDataConfig-InputFormat).
- **Client request token**: A unique identifier for the request. If you do not set the client request token, Amazon Comprehend generates one.
- **Data Access Role's ARN (mandatory)**: The Amazon Resource Name (ARN) of the IAM role that grants Amazon Comprehend read access to your input data.
- **Document Classifier's ARN**: The Amazon Resource Name (ARN) of the document classifier to use to process the job.
- **Flywheel's ARN**: The Amazon Resource Number (ARN) of the flywheel associated with the model to use.
- **Job name**: The identifier of the job.
- **Output's S3 URI (mandatory)**: The Amazon S3 location where you want to write the output data. For more details, refer to [output data config](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_OutputDataConfig.html).
- **Outputs KMS Key Id**: The ID for the AWS Key Management Service (KMS) key that Amazon Comprehend uses to encrypt the output results from an analysis job. For more details, refer to [output data config](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_OutputDataConfig.html).
- **Tags**: Tags to associate with the document classification job. A tag is a key-value pair that adds metadata to a resource used by Amazon Comprehend.
  **Example:**

```feel
= {"status": "active"}
```

- **VolumeKmsKeyId**: ID for the AWS Key Management Service (KMS) key that Amazon Comprehend uses to encrypt data on the storage volume attached to the ML compute instance(s) that process the analysis job.
- **Security group Ids**: The ID number for a security group on an instance of your private VPC. For more details, refer to [security group](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_VpcConfig.html#comprehend-Type-VpcConfig-SecurityGroupIds).
  **Example:**

```feel
= ["sg-07a2cc6d96e4ec178"]
```

- **Subnets**: The ID for each subnet being used in your private VPC. For more details, refer to [Subnets](https://docs.aws.amazon.com/comprehend/latest/APIReference/API_VpcConfig.html#comprehend-Type-VpcConfig-Subnets).
  **Example:**

```feel
= ["subnet-013eac53274e1d93f"]
```

**Note**
To use **VPC** you need at last one VPC endpoint For more details, refer to [create a VPC endpoint](https://docs.aws.amazon.com/vpc/latest/privatelink/create-interface-endpoint.html#create-interface-endpoint-aws).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/amazon-comprehend
