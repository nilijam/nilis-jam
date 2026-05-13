/**
 * functions/index.js
 * Firebase Cloud Function — Envoi du mail de bienvenue via Gmail
 *
 * SETUP (une seule fois) :
 *   1. cd functions && npm install nodemailer
 *   2. firebase functions:secrets:set GMAIL_USER    → ton-email@gmail.com
 *   3. firebase functions:secrets:set GMAIL_PASS    → mot de passe d'application Gmail
 *      (Compte Google → Sécurité → Validation en 2 étapes → Mots de passe des applications)
 *   4. firebase deploy --only functions
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret }       = require('firebase-functions/params');
const nodemailer              = require('nodemailer');
const { generateWelcomeEmail } = require('./emailTemplate');

// Secrets Firebase (jamais en clair dans le code)
const GMAIL_USER = defineSecret('GMAIL_USER');
const GMAIL_PASS = defineSecret('GMAIL_PASS');

/**
 * Callable Function : sendWelcomeEmail
 * Appelée depuis le client après une inscription réussie
 */
exports.sendWelcomeEmail = onCall(
  { secrets: [GMAIL_USER, GMAIL_PASS] },
  async (request) => {
    const { username, email, createdAt, confirmCode } = request.data;

    // Validation basique
    if (!email || !username) {
      throw new HttpsError('invalid-argument', 'email et username requis');
    }

    // Transporter Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER.value(),
        pass: GMAIL_PASS.value(), // App Password Gmail (16 caractères)
      },
    });

    const html = generateWelcomeEmail({ username, email, createdAt, confirmCode });

    const mailOptions = {
      from: `"Nili's Jam 🎧" <${GMAIL_USER.value()}>`,
      to: email,
      subject: `🎧 Bienvenue sur Nili's Jam, ${username} !`,
      html,
      // Version texte fallback
      text: `
Bienvenue sur Nili's Jam, ${username} !

Ton compte a été créé avec succès.

━━━━━━━━━━━━━━━━━━━━━━
🔐 CODE DE CONFIRMATION : ${confirmCode}
━━━━━━━━━━━━━━━━━━━━━━

📋 Informations de ton compte :
• Nom d'utilisateur : ${username}
• Email              : ${email}
• Inscription        : ${new Date(createdAt).toLocaleString('fr-FR')}
• Plan               : Gratuit

Bonne écoute !
L'équipe Nili's Jam
      `.trim(),
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Erreur envoi email:', error);
      throw new HttpsError('internal', 'Échec envoi email : ' + error.message);
    }
  }
);