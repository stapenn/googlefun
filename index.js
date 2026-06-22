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

    const mailTitle = process.env.MAIL_TITLE || "New Website Event";

    const mailSubject = process.env.MAIL_SUBJECT || "Website Notification";

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.MAIL_TO,
      subject: `${mailSubject} (${choice})`,
      text: `
${mailTitle}

Time: ${now}

Choice: ${choice}

IP:
${ip}

User-Agent:
${userAgent}
      `,
    });

    res.json({
      success: true,
      choice,
      timestamp: now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
