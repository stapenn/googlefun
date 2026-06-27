## GitHub Variables

Configure the following repository variables:

* `MAIL_TO` — recipient email address.
* `FUNCTION_NAME` — Cloud Function name (any valid name).
* `FUNCTION_REGION` — deployment region (e.g. `europe-west1`).
* `MAIL_SUBJECT` — email subject.
* `MAIL_TITLE` — email title/content displayed at the top of the message.

## GitHub Secrets

Configure the following repository secrets:

* `SMTP_USER` — Gmail address used to send emails.
* `SMTP_PASSWORD` — Gmail App Password. Generate it in your Google Account settings: https://myaccount.google.com/apppasswords
* `GCP_SA_KEY` — contents of the Service Account JSON key generated during the Google Cloud setup.

## Default SMTP Configuration

The current implementation is configured for Gmail SMTP:

* `SMTP_HOST` — `smtp.gmail.com`
* `SMTP_PORT` — `587`

If you want to use another email provider, update these values in `index.js` according to your provider's SMTP configuration.



## Optional Security

By default, the function is deployed with public HTTP access.

If needed, access restrictions can be configured directly in the Google Cloud Console during or after deployment (for example, by requiring authentication instead of allowing unauthenticated requests).

Alternatively, you can add application-level protection inside this repository.

### Secret Token

A simple option is to require a custom token for every request.

Repository changes:

* Add `FORM_TOKEN` to **GitHub Secrets**.
* Validate the token in `index.js`.
* Pass `FORM_TOKEN` through `deploy.yml`.
* Include the token in every frontend request.

### Other Options

* Google reCAPTCHA
* Cloudflare Turnstile
* Firebase Authentication
* Rate Limiting

Choose the protection method that best fits your project requirements.

