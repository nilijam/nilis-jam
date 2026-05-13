/**
 * emailTemplate.js
 * Génère le HTML du mail de bienvenue Nili's Jam
 */

function generateWelcomeEmail({ username, email, createdAt, confirmCode }) {
  const date = new Date(createdAt).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const time = new Date(createdAt).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bienvenue sur Nili's Jam</title>
</head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#111120;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.5);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a35 0%,#2d1b69 100%);padding:40px 40px 30px;text-align:center;">
              <div style="font-size:48px;margin-bottom:12px;">🎧</div>
              <h1 style="color:#ffffff;font-size:28px;margin:0;letter-spacing:-0.5px;">Nili's Jam</h1>
              <p style="color:#b06aff;font-size:14px;margin:8px 0 0;letter-spacing:2px;text-transform:uppercase;">
                Bienvenue dans la communauté
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#ffffff;font-size:22px;margin:0 0 12px;">
                Salut ${username} 👋
              </h2>
              <p style="color:#a0a0c0;font-size:15px;line-height:1.7;margin:0 0 28px;">
                Ton compte <strong style="color:#fff;">Nili's Jam</strong> a bien été créé.
                Tu peux maintenant explorer des milliers de titres, créer tes playlists,
                découvrir les artistes gabonais et bien plus encore.
              </p>

              <!-- Code de confirmation -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#1a1a35;border:1px solid #2a2a50;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="color:#b06aff;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">
                      🔐 Code de confirmation
                    </p>
                    <div style="background:#0d0d1a;border-radius:8px;padding:16px 24px;display:inline-block;">
                      <span style="color:#ffffff;font-size:32px;font-weight:700;letter-spacing:8px;font-family:monospace;">
                        ${confirmCode}
                      </span>
                    </div>
                    <p style="color:#666680;font-size:12px;margin:12px 0 0;">
                      Ce code est valable 24h. Garde-le précieusement.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Infos du compte -->
              <p style="color:#b06aff;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">
                📋 Informations de ton compte
              </p>
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#0d0d1a;border-radius:12px;overflow:hidden;margin-bottom:28px;">
                <tr style="border-bottom:1px solid #1a1a35;">
                  <td style="padding:14px 20px;color:#666680;font-size:13px;width:40%;">Nom d'utilisateur</td>
                  <td style="padding:14px 20px;color:#ffffff;font-size:13px;font-weight:600;">${username}</td>
                </tr>
                <tr style="border-bottom:1px solid #1a1a35;">
                  <td style="padding:14px 20px;color:#666680;font-size:13px;">Adresse email</td>
                  <td style="padding:14px 20px;color:#ffffff;font-size:13px;">${email}</td>
                </tr>
                <tr style="border-bottom:1px solid #1a1a35;">
                  <td style="padding:14px 20px;color:#666680;font-size:13px;">Date d'inscription</td>
                  <td style="padding:14px 20px;color:#ffffff;font-size:13px;">${date}</td>
                </tr>
                <tr style="border-bottom:1px solid #1a1a35;">
                  <td style="padding:14px 20px;color:#666680;font-size:13px;">Heure</td>
                  <td style="padding:14px 20px;color:#ffffff;font-size:13px;">${time}</td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;color:#666680;font-size:13px;">Plan</td>
                  <td style="padding:14px 20px;">
                    <span style="background:#1a1a35;color:#b06aff;font-size:12px;padding:4px 10px;border-radius:20px;font-weight:600;">
                      Gratuit
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Ce que tu peux faire -->
              <p style="color:#b06aff;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">
                🎵 Ce que tu peux faire
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                ${[
                  ['🔍', 'Explorer', 'Recherche parmi des milliers de titres via Deezer'],
                  ['❤️', 'Favoris', 'Sauvegarde tes sons préférés'],
                  ['📋', 'Playlists', 'Crée et gère tes propres playlists'],
                  ['🇬🇦', 'Gabon', 'Découvre les artistes gabonais'],
                  ['📻', 'Radio', 'Écoute des radios en direct'],
                  ['📚', 'Livres', 'Accède à ta bibliothèque EPUB'],
                ].map(([icon, title, desc]) => `
                <tr>
                  <td style="padding:8px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="background:#0d0d1a;border-radius:10px;">
                      <tr>
                        <td style="padding:12px 16px;width:40px;font-size:20px;">${icon}</td>
                        <td style="padding:12px 8px;">
                          <p style="color:#fff;font-size:13px;font-weight:600;margin:0 0 2px;">${title}</p>
                          <p style="color:#666680;font-size:12px;margin:0;">${desc}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`).join('')}
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="http://localhost:5173"
                      style="background:linear-gradient(135deg,#b06aff,#7c3aed);color:#ffffff;
                             text-decoration:none;padding:14px 40px;border-radius:50px;
                             font-size:15px;font-weight:700;display:inline-block;letter-spacing:0.3px;">
                      🎧 Accéder à Nili's Jam
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0d0d1a;padding:24px 40px;text-align:center;border-top:1px solid #1a1a35;">
              <p style="color:#444460;font-size:12px;margin:0 0 6px;">
                Tu reçois cet email car tu viens de créer un compte sur Nili's Jam.
              </p>
              <p style="color:#444460;font-size:11px;margin:0;">
                © ${new Date().getFullYear()} Nili's Jam — Tous droits réservés
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

module.exports = { generateWelcomeEmail };
