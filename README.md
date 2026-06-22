## Что нужно поменять

- `SMTP_USER` — почта, от имени которой отправляем.
- `SMTP_PASSWORD` — пароль приложения, генерируется вручную, в настройках почты [google](https://myaccount.google.com/apppasswords) 
- `MAIL_TO` — почта, куда приходят письма.

- `SMTP_HOST` — SMTP сервер. (for google: host: 'smtp.gmail.com')
  
- `SMTP_PORT` — порт SMTP. (for google: port: 587)

## Деплой
ye x
```bash
gcloud functions deploy helloHttp \
  --gen2 \
  --runtime=nodejs22 \
  --region=europe-west1 \
  --source=. \
  --entry-point=helloHttp \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars SMTP_HOST=smtp.gmail.com,SMTP_PORT=587,SMTP_SECURE=false,SMTP_USER=YOUR_EMAIL,SMTP_PASSWORD=APP_PASSWORD,MAIL_TO=TARGET_EMAIL
