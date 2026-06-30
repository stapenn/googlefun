## GitHub Variables

Configure the following repository variables:

* `MAIL_TO` — recipient email address.
* `FUNCTION_NAME` — Cloud Function name (any valid name).
* `FUNCTION_REGION` — deployment region (for example, `europe-west1`).
* `MAIL_SUBJECT` — email subject.
* `MAIL_TITLE` — email title/content displayed at the top of the message.
* `SMTP_HOST` — SMTP server host. Defaults to `smtp.gmail.com`.
* `SMTP_PORT` — SMTP server port. Defaults to `587`.
* `RECAPTCHA_SITE_KEY` — public Google reCAPTCHA v3 site key for the frontend.
* `RECAPTCHA_MIN_SCORE` — minimum accepted v3 score. Defaults to `0.5`.
* `RECAPTCHA_EXPECTED_ACTION` — optional action name expected from the frontend token, for example `submit_form`.

## GitHub Secrets

Configure the following repository secrets:

* `SMTP_USER` — Gmail address used to send emails.
* `SMTP_PASSWORD` — Gmail App Password. Generate it in your Google Account settings: https://myaccount.google.com/apppasswords
* `GCP_SA_KEY` — contents of the Service Account JSON key generated during the Google Cloud setup.
* `RECAPTCHA_SECRET_KEY` — private Google reCAPTCHA v3 secret key used by the Cloud Function.

## Environment Sync

Copy `.env.example` to `.env`, fill the values, then sync them to GitHub:

```bash
pnpm sync:secrets
```

The script uploads filled secret values with `gh secret set` and filled variable values with `gh variable set`.

Quote values with spaces in `.env`, for example `MAIL_SUBJECT="Website Notification"`.

For `GCP_SA_KEY`, prefer setting `GCP_SA_KEY_FILE` to a local JSON file path. You can also paste the service account JSON as a multiline value after `GCP_SA_KEY=`.

## Frontend reCAPTCHA v3

Load Google reCAPTCHA with the public site key:

```html
<script src="https://www.google.com/recaptcha/api.js?render=RECAPTCHA_SITE_KEY"></script>
```

Before sending the form request, execute v3 and include the token in the JSON body:

```js
const action = "submit_form";

const recaptchaToken = await grecaptcha.execute("RECAPTCHA_SITE_KEY", {
  action,
});

await fetch("YOUR_CLOUD_FUNCTION_URL", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    choice,
    recaptchaToken,
  }),
});
```

If you change the frontend `action`, update `RECAPTCHA_EXPECTED_ACTION` to the same value.

## Default SMTP Configuration

The current implementation is configured for Gmail SMTP:

* `SMTP_HOST` — `smtp.gmail.com`
* `SMTP_PORT` — `587`

If you want to use another email provider, update these variables according to your provider's SMTP configuration.

## Security

The function is deployed with public HTTP access, but every request must pass Google reCAPTCHA v3 validation before an email is sent.

Additional access restrictions can still be configured directly in the Google Cloud Console during or after deployment, for example by requiring authentication instead of allowing unauthenticated requests.
