import { http } from "@google-cloud/functions-framework";
import nodemailer from "nodemailer";

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const DEFAULT_RECAPTCHA_MIN_SCORE = 0.5;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.socket?.remoteAddress || "unknown";
}

function getRecaptchaToken(req) {
  return (
    req.body?.recaptchaToken ||
    req.body?.captchaToken ||
    req.body?.["g-recaptcha-response"] ||
    req.headers["x-recaptcha-token"]
  );
}

function getRecaptchaMinScore() {
  const minScore = Number(process.env.RECAPTCHA_MIN_SCORE);

  if (Number.isNaN(minScore)) {
    return DEFAULT_RECAPTCHA_MIN_SCORE;
  }

  return minScore;
}

async function verifyRecaptcha({ token, ip }) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    throw new Error("RECAPTCHA_SECRET_KEY is not configured");
  }

  if (!token) {
    return {
      ok: false,
      status: 400,
      reason: "Missing reCAPTCHA token",
    };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (ip !== "unknown") {
    body.set("remoteip", ip);
  }

  const response = await fetch(RECAPTCHA_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`reCAPTCHA verification failed with ${response.status}`);
  }

  const result = await response.json();
  const minScore = getRecaptchaMinScore();
  const expectedAction = process.env.RECAPTCHA_EXPECTED_ACTION;

  if (!result.success) {
    return {
      ok: false,
      status: 403,
      reason: "reCAPTCHA verification failed",
    };
  }

  if (typeof result.score === "number" && result.score < minScore) {
    return {
      ok: false,
      status: 403,
      reason: "reCAPTCHA score is too low",
    };
  }

  if (expectedAction && result.action !== expectedAction) {
    return {
      ok: false,
      status: 403,
      reason: "reCAPTCHA action mismatch",
    };
  }

  return {
    ok: true,
    score: result.score,
    action: result.action,
  };
}

http("helloHttp", async (req, res) => {
  try {
    const choice = req.body?.choice || "unknown";
    const ip = getClientIp(req);
    const recaptcha = await verifyRecaptcha({
      token: getRecaptchaToken(req),
      ip,
    });

    if (!recaptcha.ok) {
      res.status(recaptcha.status).json({
        success: false,
        error: recaptcha.reason,
      });
      return;
    }

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

reCAPTCHA:
score=${recaptcha.score ?? "unknown"}
action=${recaptcha.action ?? "unknown"}

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
