## Что нужно проставить в variables

- `MAIL_TO` — почта, куда приходят письма.
- `FUNCTION_NAME` - название функции(любое) 
- `FUNCTION_REGION` - регион, который автоматически определятеся в google cosole
- `MAIL_TITLE` - тема письма
- `MAIL_SUBJECT` - содержание

## Что нужно проставить в secrets
-  `SMTP_USER` — почта, от имени которой отправляем.
- `SMTP_PASSWORD` — пароль приложения, генерируется вручную, в настройках почты [google](https://myaccount.google.com/apppasswords) 
- `GCP_SA_KEY` - вставить содержимое json файла (*)

## Проставлено для google сервисов(index.js)
- `SMTP_HOST` — SMTP сервер. (for google: host: 'smtp.gmail.com')
- `SMTP_PORT` — порт SMTP. (for google: port: 587)

(*)
## Google Cloud Setup

### 1. Create a Google Cloud Project

Create a new project in Google Cloud Console.

### 2. Create a Service Account

Open:

Google Cloud Console → IAM & Admin → Service Accounts

or visit:

https://console.cloud.google.com/iam-admin/serviceaccounts

Click:

Create Service Account

Example name:

github-actions-deploy

### 3. Grant Required Roles

Assign the following roles to the Service Account:

* Cloud Functions Developer
* Cloud Run Admin
* Service Account User
* Cloud Build Editor
* Artifact Registry Writer

If you encounter permission issues during deployment, you can temporarily assign:

* Editor

and later replace it with more restrictive roles.

### 4. Create a Service Account Key

Open the created Service Account:

github-actions-deploy

Navigate to:

Keys → Add Key → Create New Key → JSON

A JSON file will be downloaded.

Example:

project-123456-abcdef.json

### 5. Add the Key to GitHub

Open your repository:

Settings → Secrets and variables → Actions

Create a new Repository Secret:

Name:

GCP_SA_KEY

Value:

Paste the entire contents of the downloaded JSON file.

Example:

{
"type": "service_account",
"project_id": "...",
"private_key_id": "...",
"private_key": "...",
...
}

### 6. Enable Required APIs

Open:

Google Cloud Console → APIs & Services → Library

Enable the following APIs:

* Cloud Functions API
* Cloud Run Admin API
* Cloud Build API
* Artifact Registry API

Wait a few minutes for the changes to propagate before running the deployment workflow.
