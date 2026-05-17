import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { getSiteContent } from "@/lib/site-content-store";
import { addContactSubmission } from "@/lib/submissions-store";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    }),
    from,
  };
}

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }

    // 1. Save in DB / local storage
    const storeRes = await addContactSubmission(name, email, subject, message);

    // 2. Fetch CMS configured admin email (default to llateamd@gmail.com)
    const content = await getSiteContent();
    const adminEmail = content.site.adminEmail || "llateamd@gmail.com";

    // 3. Send Email
    const mailConfig = getTransporter();
    let emailSent = false;
    let emailError = "";

    if (mailConfig) {
      const { transporter, from } = mailConfig;
      
      const mailOptions = {
        from: `"Fidelis Formulaires" <${from}>`,
        to: adminEmail,
        replyTo: email,
        subject: `[Contact Fidelis] ${subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #00A86B; border-bottom: 2px solid #00A86B; padding-bottom: 10px;">Nouveau Message de Contact</h2>
            <p><strong>Nom :</strong> ${name}</p>
            <p><strong>E-mail :</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Objet :</strong> ${subject}</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #00A86B; margin-top: 20px;">
              <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
              Ce message a été envoyé depuis le formulaire de contact du site Carte Fidelis et sauvegardé de manière sécurisée en base de données.
            </p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (err: any) {
        emailError = err.message;
        console.error("Nodemailer failed to send email:", err);
      }
    } else {
      console.warn("SMTP settings are not configured in environment variables. Email notification skipped.");
    }

    return NextResponse.json({
      success: true,
      message: "Message enregistré avec succès !",
      emailSent,
      emailError: emailError || undefined,
      storageMode: storeRes.mode,
    });
  } catch (err: any) {
    console.error("Contact API endpoint error:", err);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
