# BrajSahayak — Beginner-Friendly Complete AWS Deployment Guide

This guide walks you through every single click and command to deploy **BrajSahayak** to AWS, starting with **how to get your AWS Access Keys**.

---

## PART 1: How to Get Your AWS Access Key & Secret Key

If you do not have your Access Key ID and Secret Access Key yet, follow these exact steps in your browser:

### Step 1.1: Log into AWS Console
1. Open your browser and go to: [https://aws.amazon.com/console/](https://aws.amazon.com/console/)
2. Click **Sign In to the Console**.
3. Sign in as the **Root user** (or your IAM user with AdministratorAccess).

### Step 1.2: Navigate to Security Credentials
1. Look at the **top-right corner** of the AWS Console where your account name appears.
2. Click on your **Account Name** to open the dropdown menu.
3. Click on **Security credentials**.
   *(Alternative: In the top search bar, type "IAM" and click on **IAM**).*

### Step 1.3: Create Access Key
1. Scroll down to the section titled **Access keys**.
2. Click the button: **Create access key**.
3. You will see a list of use cases. Select:
   🔘 **Command Line Interface (CLI)**
4. Scroll to the bottom, check the confirmation checkbox:
   ☑️ *"I understand the above recommendation and want to proceed to create an access key."*
5. Click **Next**.
6. (Optional) In Description tag value, type: `BrajSahayak-Key`.
7. Click **Create access key**.

### Step 1.4: Save Your Keys (CRITICAL)
You will see two values on your screen:
- **Access key**: (Starts with `AKIA...`, e.g. `AKIAIOSFODNN7EXAMPLE`)
- **Secret access key**: (A long string like `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)

👉 **Click "Download .csv file"** to save these keys to your computer!  
*(Note: You will NEVER be able to see the Secret Access Key again after closing this screen).*

---

## PART 2: Configure AWS CLI on Your Mac Terminal

Now connect your Mac to your AWS account:

1. Open your Mac Terminal.
2. Run this command:
   ```bash
   aws configure
   ```
3. Enter the details one by one as prompted:
   ```text
   AWS Access Key ID [None]: <Paste your Access Key ID here>
   AWS Secret Access Key [None]: <Paste your Secret Access Key here>
   Default region name [None]: ap-south-1
   Default output format [None]: json
   ```
   *(Note: `ap-south-1` is the AWS Mumbai Region, ideal for India-based applications).*

4. **Verify your connection:**
   Run:
   ```bash
   aws sts get-caller-identity
   ```
   If you see your `UserId`, `Account`, and `Arn`, your Mac is connected to AWS!

---

## PART 3: Amazon S3 Setup (For Temple Photos)

### Option A: Via Terminal (Fastest - 30 seconds)
```bash
# 1. Create a unique bucket name (e.g. brajsahayak-assets-<yourname>)
BUCKET_NAME="brajsahayak-assets-$USER"
aws s3 mb "s3://$BUCKET_NAME" --region ap-south-1

# 2. Enable public read access for website visitors
aws s3api put-public-access-block --bucket "$BUCKET_NAME" \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# 3. Add public read policy
cat << POLICY > /tmp/s3-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
POLICY

aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file:///tmp/s3-policy.json

# 4. Upload your temple images to S3
aws s3 sync ~/Desktop/brajsahayak/frontend/public/images/ "s3://$BUCKET_NAME/images/"
```

### Option B: Via AWS Console (GUI)
1. Search **S3** in the top search bar.
2. Click **Create bucket**.
3. Bucket name: `brajsahayak-assets-yourname` (must be lowercase, unique).
4. AWS Region: `Asia Pacific (Mumbai) ap-south-1`.
5. Under **Object Ownership**, keep *ACLs disabled*.
6. Under **Block Public Access settings**, **UNCHECK** *"Block all public access"*, and check the warning box below it.
7. Click **Create bucket**.
8. Click on your new bucket, go to the **Permissions** tab -> **Bucket policy** -> Click **Edit** -> Paste the policy above replacing `BUCKET_NAME` with your bucket name -> Save changes.
9. Go to **Objects** tab -> Click **Upload** -> Drag & drop the `frontend/public/images` folder.

---

## PART 4: Amazon RDS PostgreSQL Database Setup

### Option A: Via AWS Console (GUI - Recommended for beginners)
1. Search **RDS** in the top search bar.
2. Click the orange **Create database** button.
3. Choose a database creation method: **Standard create**.
4. Engine type: **PostgreSQL**.
5. Engine Version: Keep default (e.g. `PostgreSQL 16.3` or `15.x`).
6. Templates: Select **Free tier** (this avoids any unnecessary AWS charges).
7. Settings:
   - DB instance identifier: `brajsahayak-db`
   - Master username: `postgres`
   - Master password: `BrajSahayak2026Secure!` (or choose your own, but remember it!)
   - Confirm password: `BrajSahayak2026Secure!`
8. Instance configuration:
   - DB instance class: `db.t4g.micro` (or `db.t3.micro`).
9. Storage:
   - Allocated storage: `20` GiB.
   - Storage autoscaling: Uncheck *Enable storage autoscaling*.
10. Connectivity:
   - Virtual private cloud (VPC): Default VPC.
   - Public access: **Yes** *(Critical: allows local setup to seed data into it!)*.
   - VPC security group: Choose **Create new**, name: `brajsahayak-rds-sg`.
11. Click **Create database** at the bottom.
12. Wait ~4 to 5 minutes until Status changes from `Creating` to **Available**.
13. Click on `brajsahayak-db` and look at the **Connectivity & security** section.
14. **Copy the "Endpoint"** (it looks like: `brajsahayak-db.cxxxxxx.ap-south-1.rds.amazonaws.com`).

### Allow Database Port 5432 in Security Group:
1. Click the link under **VPC security groups** (`brajsahayak-rds-sg`).
2. Select the security group -> Click **Edit inbound rules**.
3. Type: **PostgreSQL** (Port 5432).
4. Source: **Anywhere-IPv4** (`0.0.0.0/0`).
5. Click **Save rules**.

### Step 4.2: Migrate and Seed Database from Your Mac
Run these commands in your Mac terminal (replace `<YOUR-RDS-ENDPOINT>` with the endpoint copied above):

```bash
cd ~/Desktop/brajsahayak/backend

# Switch Prisma to PostgreSQL schema
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# Push tables to AWS RDS PostgreSQL
DATABASE_URL="postgresql://postgres:BrajSahayak2026Secure!@<YOUR-RDS-ENDPOINT>:5432/postgres?schema=public" \
npx prisma db push

# Seed all 32 temples and crowd telemetry to AWS RDS
DATABASE_URL="postgresql://postgres:BrajSahayak2026Secure!@<YOUR-RDS-ENDPOINT>:5432/postgres?schema=public" \
npx tsx prisma/seed.ts
```
*(You will see: "Seeded Temples and Parking Options. Seeded Monitored Crowd Locations. Database Seeding Complete!").*

---

## PART 5: Package & Deploy Backend to AWS Lambda

### Step 5.1: Create Lambda Execution Role
Run in Terminal:
```bash
cat << ROLE > /tmp/lambda-role.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
ROLE

ROLE_ARN=$(aws iam create-role \
  --role-name BrajSahayakLambdaRole \
  --assume-role-policy-document file:///tmp/lambda-role.json \
  --query "Role.Arn" --output text)

aws iam attach-role-policy \
  --role-name BrajSahayakLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

### Step 5.2: Build & Zip Backend
```bash
cd ~/Desktop/brajsahayak/backend
npm run build

# Create deployment zip
zip -r /tmp/brajsahayak-backend.zip dist node_modules package.json data prisma
```

### Step 5.3: Create Lambda Function
Run this command in Terminal (replace `<YOUR-RDS-ENDPOINT>` and `<YOUR-BUCKET-NAME>`):

```bash
aws lambda create-function \
  --function-name brajsahayak-api \
  --runtime nodejs20.x \
  --role $ROLE_ARN \
  --handler dist/lambda.handler \
  --zip-file fileb:///tmp/brajsahayak-backend.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment "Variables={
    NODE_ENV=production,
    DATABASE_URL=postgresql://postgres:BrajSahayak2026Secure!@<YOUR-RDS-ENDPOINT>:5432/postgres?schema=public,
    AI_PROVIDER=grounded-knowledge-engine,
    STORAGE_PROVIDER=s3,
    S3_BUCKET_NAME=<YOUR-BUCKET-NAME>,
    AWS_REGION=ap-south-1,
    AUTHORITY_ADMIN_KEY=braj-authority-secure-key,
    CORS_ORIGIN=*
  }" \
  --region ap-south-1
```

---

## PART 6: Connect Amazon API Gateway to Lambda

Run these commands in Terminal to expose your backend to the internet:

```bash
# 1. Create HTTP API
API_ID=$(aws apigatewayv2 create-api \
  --name "brajsahayak-gateway" \
  --protocol-type HTTP \
  --cors-configuration "AllowOrigins=*,AllowMethods=GET,POST,PATCH,DELETE,OPTIONS,AllowHeaders=*" \
  --query "ApiId" --output text)

LAMBDA_ARN=$(aws lambda get-function --function-name brajsahayak-api --query "Configuration.FunctionArn" --output text)

# 2. Connect API Gateway to Lambda
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri $LAMBDA_ARN \
  --payload-format-version "2.0" \
  --query "IntegrationId" --output text)

# 3. Create route to forward all requests to Express app
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "$default" \
  --target "integrations/$INTEGRATION_ID"

# 4. Deploy stage
aws apigatewayv2 create-stage \
  --api-id $API_ID \
  --stage-name "$default" \
  --auto-deploy

# 5. Grant API Gateway permission to trigger Lambda
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws lambda add-permission \
  --function-name brajsahayak-api \
  --statement-id apigateway-access \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:ap-south-1:$ACCOUNT_ID:$API_ID/*"

API_URL="https://$API_ID.execute-api.ap-south-1.amazonaws.com"
echo "============================================="
echo "YOUR LIVE BACKEND API URL: $API_URL"
echo "============================================="
```

Test your live cloud backend right from Terminal:
```bash
curl "$API_URL/api/health"
curl "$API_URL/api/temples"
```
*(If you see `{ "status": "ok", "aiProvider": "grounded-knowledge-engine" }`, your AWS Lambda + RDS backend is live!)*

---

## PART 7: Deploy Frontend to AWS Amplify (2 Minutes)

### Step 7.1: Build Frontend with Your Live API URL
In your Terminal:
```bash
cd ~/Desktop/brajsahayak/frontend

# Put your API Gateway URL into .env.production
echo "VITE_API_BASE_URL="$API_URL/api"" > .env.production

# Build production bundle
npm run build

# Zip the compiled dist folder
cd dist && zip -r ../dist.zip .
```

### Step 7.2: Upload to AWS Amplify Console
1. Open the [AWS Amplify Console in Mumbai](https://ap-south-1.console.aws.amazon.com/amplify/home?region=ap-south-1).
2. Click the orange button: **Deploy an app** (or **New app** -> **Host web app**).
3. Under *"Deploy without Git provider"*:
   - Select **Deploy without Git**.
4. App name: `BrajSahayak`.
5. Environment name: `prod`.
6. Method: Choose **Drag and drop**.
7. Drag your newly created `~/Desktop/brajsahayak/frontend/dist.zip` file into the box.
8. Click **Save and deploy**.
9. Amplify will deploy your website in ~30 seconds and give you a public HTTPS URL (e.g. `https://main.d123456789.amplifyapp.com`)!

---

## PART 8: Complete Testing & Verification

Open your new **Amplify URL** on your phone or computer:
1. **Temple Explorer (`/temples`)**: Check that sacred places load cleanly with images from S3.
2. **AI Braj Assistant (`/assistant`)**: Test queries in English, Hindi, and Hinglish (*"Banke Bihari parking"*, *"श्री कृष्ण जन्मभूमि दर्शन का समय"*).
3. **Yatra Planner (`/planner`)**: Generate a 5-hour itinerary.
4. **Stampede Saviour Public Monitor (`/safety`)**: View live density meters for Temples, Mathura Junction Railway Station, and Bus Stand.
5. **Authority Control Console (`/authority`)**: Test the simulation harness (*"Simulate Banke Bihari Surge"*) and acknowledge alerts.
