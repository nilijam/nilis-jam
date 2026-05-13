/**
 * src/services/emailService.js
 * Envoi du mail de bienvenue via EmailJS
 */

import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID  = 'service_ozt09dd';
const EMAILJS_TEMPLATE_ID = 'template_h36ogu7';
const EMAILJS_PUBLIC_KEY  = 'EgCACY603BA2L1bQo';

/**
 * Génère un code de confirmation à 6 chiffres
 */
export function generateConfirmCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Envoie le mail de bienvenue après inscription
 */
export async function sendWelcomeEmail({ username, email, createdAt, confirmCode }) {
  try {
    const date = new Date(createdAt).toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const time = new Date(createdAt).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit',
    });

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        username,
        email,
        confirmCode,
        createdAt: `${date} à ${time}`,
      },
      { publicKey: EMAILJS_PUBLIC_KEY }
    );

    console.log('✅ Email de bienvenue envoyé à', email);
  } catch (error) {
    console.warn('⚠️ Email non envoyé (non bloquant):', error);
  }
}