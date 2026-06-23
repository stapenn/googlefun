## Что нужно проставить в variables

- `MAIL_TO` — почта, куда приходят письма.
- `FUNCTION_NAME` - название функции(любое) 
- `FUNCTION_REGION` - регион, который автоматически определятеся в google cosole
- `MAIL_SUBJECT` - тема письма
- `MAIL_TITLE` - содержание

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

## Optional Security

By default, the deployed function is publicly accessible via its URL.

If you want to restrict access, you can add one of the following protection methods.

### Option 1: Secret Token (Recommended)

Store a secret token in GitHub Secrets:

Settings → Secrets and variables → Actions → Secrets

Create:

FORM_TOKEN

Example:

FORM_TOKEN=8df91bcb8e9d4b1ba7a2d15c91f01c77

### Repository Changes

#### 1. Update index.js

Add the following validation before processing the request:

```javascript
const expectedToken = process.env.FORM_TOKEN;
const receivedToken = req.headers["x-form-token"];

if (!expectedToken || receivedToken !== expectedToken) {
  return res.status(403).json({
    success: false,
    error: "Forbidden",
  });
}
```

#### 2. Update deploy.yml

Add FORM_TOKEN to environment variables:

```yaml
FORM_TOKEN=${{ secrets.FORM_TOKEN }}
```

Example:

```yaml
--set-env-vars "SMTP_USER=${{ secrets.SMTP_USER }},SMTP_PASSWORD=${{ secrets.SMTP_PASSWORD }},MAIL_TO=${{ vars.MAIL_TO }},MAIL_TITLE=${{ vars.MAIL_TITLE }},MAIL_SUBJECT=${{ vars.MAIL_SUBJECT }},FORM_TOKEN=${{ secrets.FORM_TOKEN }}"
```

#### 3. Frontend Changes

Include the token in every request:

```javascript
fetch(FUNCTION_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-form-token": "YOUR_SECRET_TOKEN"
  },
  body: JSON.stringify({
    choice: "1"
  })
});
```

### Advantages

* Very easy to implement
* No additional services required
* Prevents accidental or unauthorized requests

### Limitations

* The token can be extracted from frontend code
* Not suitable as the only protection mechanism for sensitive applications

---

### Other Security Options

#### Google reCAPTCHA

Requires frontend integration and token verification inside the Cloud Function.

Good protection against bots and spam.

#### Cloudflare Turnstile

Modern alternative to reCAPTCHA.

Provides bot protection with better privacy and user experience.

#### Firebase Authentication

Allows only authenticated users to access the function.

Suitable for private dashboards and internal applications.

#### Rate Limiting

Limits the number of requests from a single IP address within a given time period.

Can be combined with any of the methods above.

---

### Recommended Setup

For most contact forms the following combination is sufficient:

* Secret Token
* Cloudflare Turnstile (or Google reCAPTCHA)
* Rate Limiting

This setup provides a good balance between simplicity and security.
