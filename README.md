
---

## HD BANK LEARNING MANAGEMENT SYSTEM

### 1. Architect Overview

The HD Bank Learning Management System is a cloud-based platform designed for managing educational content, user interactions, and administrative tasks. It consists of two main components:

- **lms**: The core Learning Management System used by students and instructors.
- **lms-studio**: The administration and content management interface.

The architecture leverages AWS services such as Amplify, Cognito, S3, DynamoDB, and Lambda, ensuring scalability, security, and ease of deployment.

---

### 2. Clone Code

To begin, clone the project repository from GitHub:

```bash
git clone https://github.com/awsstudygroup/LMS-HDBank.git
```

---

### 3. Download Amplify CLI

Follow the official [Amplify Setup Instructions](https://docs.amplify.aws/cli/start/install/#configure-the-amplify-cli) to install and configure the Amplify CLI on your local environment.

**Important:**
- Ensure you select the **Singapore Region** during configuration.
- Use your personal Isengard account for AWS Console access.

---

### 4. Init Amplify and Connect Your Local Environment to the Cloud

This section guides you through initializing the Amplify project for both `lms` and `lms-studio` components.

#### Step 1: Initialize Amplify for lms

1. Navigate to the `lms` directory:
   ```bash
   cd lms-HDBank/lms
   ```
2. Initialize Amplify:
   ```bash
   sudo amplify init
   ```
3. Provide the following configuration during setup:
   - **Environment name**: `hdbank`
   - **Default editor**: Your preferred code editor
   - **Authentication method**: `AWS profile`
   - **AWS profile**: The profile configured during Amplify CLI setup
4. Push changes to AWS:
   ```bash
   amplify push
   ```

#### Step 2: Initialize Amplify for lms-studio

1. Navigate to the `lms-studio` directory:
   ```bash
   cd lms-HDBank/lms-studio
   ```
2. Initialize Amplify:
   ```bash
   sudo amplify init
   ```
3. During initialization:
   - Import relevant DynamoDB tables (e.g., `courses-dev`, `lecture-resource`).
   - Ensure S3 bucket names follow the format `lecture-resource-[environment name]`.
4. Push configurations to the cloud:
   ```bash
   amplify push
   ```

#### Step 3: S3 Access Policy for Lecture Resources

Configure an S3 access policy to manage permissions for users interacting with lecture resources. The following JSON policy allows specific actions based on user roles:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::{s3-bucket-name}/public/*",
                "arn:aws:s3:::{s3-bucket-name}/protected/${cognito-identity.amazonaws.com:sub}/*",
                "arn:aws:s3:::{s3-bucket-name}/private/${cognito-identity.amazonaws.com:sub}/*"
            ],
            "Effect": "Allow"
        },
        {
            "Action": [
                "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:s3:::{s3-bucket-name}/uploads/*"
            ],
            "Effect": "Allow"
        },
        {
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::{s3-bucket-name}/protected/*"
            ],
            "Effect": "Allow"
        },
        {
            "Condition": {
                "StringLike": {
                    "s3:prefix": [
                        "public/",
                        "public/*",
                        "protected/",
                        "protected/*",
                        "private/${cognito-identity.amazonaws.com:sub}/",
                        "private/${cognito-identity.amazonaws.com:sub}/*"
                    ]
                }
            },
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::{s3-bucket-name}"
            ],
            "Effect": "Allow"
        }
    ]
}
```

After creating the policy, attach it to the **amplify-lmsstudio-hdbank-id-authRole** in IAM.

---

### 5. Check if Your Apps are Active

To verify if `lms` and `lmsstudio` are active:

1. Log in to your AWS account.
2. Navigate to the Amplify service.
3. Check the status of your applications on the dashboard.

---

### 6. Run Frontend from Your Local Laptop

#### 6.1. How to Run LMS FE

1. Navigate to the `lms` directory:
   ```bash
   cd LMS/lms/
   ```
2. Install dependencies:
   ```bash
   npm i
   ```
3. Start the application:
   ```bash
   npm start
   ```

#### 6.2. How to Run LMS-Studio FE

1. Navigate to the `lms-studio` directory:
   ```bash
   cd LMS/lms-studio/
   ```
2. Install dependencies:
   ```bash
   npm i
   ```
3. Start the application:
   ```bash
   npm start
   ```

---

### 7. Add Sample Data to DynamoDB Tables

To populate your DynamoDB tables:

1. Navigate to the `sample-data` folder.
2. Add the JSON files to your tables using the DynamoDB Console's JSON view.

---

### 8. How to Contribute to the Source Code?

1. **Clone the Repository**: Ensure you're on the master branch.
2. **Create a Feature Branch**: Use the naming convention `f_feature_name`.
3. **Develop and Test**: Implement and test your features within this branch.
4. **API Integration**: Use existing APIs and ensure resources like DynamoDB tables and S3 buckets are correctly imported.

---

### 9. Publishing the Application

To deploy your application:

1. Navigate to the `lms` directory and publish:
   ```bash
   cd lms
   amplify publish
   ```
2. Navigate to the `lms-studio` directory and publish:
   ```bash
   cd lms-studio
   amplify publish
   ```

---

### 10. Demonstrations

View detailed demos of the application:

- **AWS Cloud Academy Studio**: [Demo Link](#)
- **Cloud Solution Journey**: [Demo Link](#)

---

### 11. Additional Step After Publishing

After publishing, configure custom user attributes in Cognito for both `lms` and `lms-studio` user pools.

---

### 12. After Logging In and Creating an Account

To become a Studio Administrator:

1. Go to Amazon Cognito.
2. Select **User Pools**.
3. Choose `lmsstudio-id_userpool_id-hdbank`.
4. Edit the `custom:role` attribute of your user account to `admin`.

---

### 13. Deploying Your Application with Amplify

Deploy your application using a Git provider:

1. **Create a New App** in the Amplify interface.
2. **Select Git Provider**: Choose **Code Commit**.
3. **Add Repository and Branch**: Specify the repository, branch, and monorepo root directory.
4. **Select a Backend Environment** and deploy.

--- 

