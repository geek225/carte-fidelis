import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { getSiteContent } from "@/lib/site-content-store";
import { addFinancingSubmission } from "@/lib/submissions-store";

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
    const {
      nom,
      prenom,
      dateNaissance,
      ville,
      quartier,
      situationMatrimoniale,
      phone,
      hasLocal,
    } = await request.json();

    if (
      !nom ||
      !prenom ||
      !dateNaissance ||
      !ville ||
      !quartier ||
      !situationMatrimoniale ||
      !phone ||
      hasLocal === undefined ||
      hasLocal === null
    ) {
      return NextResponse.json({ error: "Tous les champs requis doivent être renseignés." }, { status: 400 });
    }

    // 1. Fetch config to get exact amount
    const content = await getSiteContent();
    const adminEmail = content.site.adminEmail || "llateamd@gmail.com";
    const amount = hasLocal
      ? (content.financing?.amountWithLocal || "300.000 FCFA")
      : (content.financing?.amountWithoutLocal || "200.000 FCFA");

    // 2. Save in database / local fallback
    const storeRes = await addFinancingSubmission(
      nom,
      prenom,
      dateNaissance,
      ville,
      quartier,
      situationMatrimoniale,
      phone,
      hasLocal,
      amount,
    );

    // 3. Send Email
    const mailConfig = getTransporter();
    let emailSent = false;
    let emailError = "";

    if (mailConfig) {
      const { transporter, from } = mailConfig;
      
      const mailOptions = {
        from: `"Fidelis Financements" <${from}>`,
        to: adminEmail,
        subject: `[Demande Financement] ${prenom} ${nom} - ${amount}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #00A86B; border-bottom: 2px solid #00A86B; padding-bottom: 10px; margin-top: 0;">Nouvelle Demande d'Accompagnement</h2>
            
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
              <span style="font-size: 14px; color: #166534; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Montant Estimé</span>
              <h1 style="color: #16a34a; margin: 5px 0 0 0; font-size: 32px; font-weight: 800;">${amount}</h1>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; font-weight: bold; color: #475569; width: 40%;">Nom & Prénom(s) :</td>
                <td style="padding: 10px 0; color: #0f172a;">${nom} ${prenom}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; font-weight: bold; color: #475569;">Date de naissance :</td>
                <td style="padding: 10px 0; color: #0f172a;">${dateNaissance}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; font-weight: bold; color: #475569;">Situation matrimoniale :</td>
                <td style="padding: 10px 0; color: #0f172a;">${situationMatrimoniale}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; font-weight: bold; color: #475569;">Téléphone :</td>
                <td style="padding: 10px 0; color: #0f172a;"><strong>${phone}</strong></td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; font-weight: bold; color: #475569;">Adresse / Localisation :</td>
                <td style="padding: 10px 0; color: #0f172a;">${ville}, Quartier ${quartier}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; font-weight: bold; color: #475569;">Statut local :</td>
                <td style="padding: 10px 0; color: #0f172a;">
                  ${hasLocal ? "✅ Dispose d'un local commercial" : "❌ Ne dispose pas de local commercial"}
                </td>
              </tr>
            </table>

            <p style="font-size: 12px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; text-align: center;">
              Cette demande d'accompagnement financier a été enregistrée de manière sécurisée en base de données Fidelis.
            </p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (err: any) {
        emailError = err.message;
        console.error("Nodemailer failed to send financing email:", err);
      }
    } else {
      console.warn("SMTP settings are not configured in environment variables. Email notification skipped.");
    }

    return NextResponse.json({
      success: true,
      message: "Votre demande a été enregistrée avec succès !",
      emailSent,
      emailError: emailError || undefined,
      storageMode: storeRes.mode,
    });
  } catch (err: any) {
    console.error("Financing API endpoint error:", err);
    return NextResponse.json({ error: "Une erreur interne est survenue lors de l'enregistrement." }, { status: 500 });
  }
}
