export type NotificationPayload = {
  title: string;
  content: string;
};

const TITRE_MAX = 1200;
const CONTENU_MAX = 20000;

/**
 * Notifie l'équipe AJIHAD d'une nouvelle soumission.
 *
 * Ce site n'est plus lié à un fournisseur particulier : la notification part
 * par webhook si `NOTIFICATION_WEBHOOK_URL` est renseigné (Slack, Discord,
 * Zapier, n8n, ou n'importe quel point d'entrée acceptant du JSON). Sans
 * configuration, la soumission est simplement journalisée : elle reste
 * consultable dans /admin/soumissions, rien n'est perdu.
 *
 * Renvoie `true` si la notification a bien été acceptée par le destinataire.
 * N'échoue jamais bruyamment : une notification ratée ne doit pas empêcher
 * l'enregistrement d'une candidature.
 */
export async function notifyOwner(payload: NotificationPayload): Promise<boolean> {
  const titre = payload.title?.trim().slice(0, TITRE_MAX);
  const contenu = payload.content?.trim().slice(0, CONTENU_MAX);

  if (!titre || !contenu) {
    console.warn("[Notification] Titre ou contenu vide, envoi ignoré.");
    return false;
  }

  const webhook = process.env.NOTIFICATION_WEBHOOK_URL;
  if (!webhook) {
    console.info(`[Notification] ${titre} — ${contenu}`);
    return false;
  }

  try {
    const reponse = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      // `text` couvre Slack et Discord ; `title`/`content` servent aux
      // destinataires génériques. Un seul appel convient aux deux familles.
      body: JSON.stringify({
        text: `${titre}\n${contenu}`,
        title: titre,
        content: contenu,
      }),
    });

    if (!reponse.ok) {
      console.warn(`[Notification] Refus du webhook (${reponse.status} ${reponse.statusText}).`);
      return false;
    }
    return true;
  } catch (erreur) {
    console.warn("[Notification] Webhook injoignable :", erreur);
    return false;
  }
}
