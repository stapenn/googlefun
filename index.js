import { http } from "@google-cloud/functions-framework";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

http("helloHttp", async (req, res) => {
  try {
    const choice = req.body?.choice || "unknown";

    const ip =
      req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";

    const userAgent = req.headers["user-agent"] || "unknown";
    const now = new Date().toISOString();

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.MAIL_TO,
      subject: `Новый заход (${choice})`,
      text: `
Время: ${now}

Выбор: ${choice}

IP:
${ip}

User-Agent:
${userAgent}
      `,
    });

    res.json({
      success: true,
      choice,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
