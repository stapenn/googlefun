import { http } from "@google-cloud/functions-framework";
import nodemailer from "nodemailer";

http("helloHttp", async (req, res) => {
  try {
    const { name, email, message, choice } = req.body || {};

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.MAIL_TO,
      subject: "Новая заявка с формы",
      text: `
Имя: ${name || "-"}
Email: ${email || "-"}
Сообщение: ${message || "-"}
Выбор: ${choice || "-"}

Время: ${new Date().toISOString()}
`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
