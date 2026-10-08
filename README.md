# Collaborateur — Beauty and Co

Web app mobile (Next.js 16, Tailwind 4, daisyUI, zustand).

```bash
npm install
npm run dev   # http://localhost:3000 — ouvrir en vue mobile (375px)
```

Sur ordinateur, l'app affiche « Ouvrez l'app sur votre téléphone » : pour développer, passer en émulation mobile dans les outils du navigateur (ou une fenêtre de moins de 768px).

## Structure

```
app/                  routes (App Router), layout, globals.css, polices
components/
  shell/              cadre mobile (header, nav du bas…)
  ui/atoms/           briques UI simples (bouton, badge, input…)
  ui/molecules/       compositions (dialog, carte, liste…)
  providers/          contextes React
app/(auth)/          connexion
app/(premiere-connexion)/  photo, code, biométrie
app/(app)/            accueil, paramètres, demandes (session requise)
lib/
  api/                API simulée — seule porte des écrans vers les données
  data/               types + données mock (équipe reprise de point-de-vente)
  store/              « base » simulée + session (zustand, localStorage)
  format.ts           téléphone, code, FCFA, note
  routes.ts           routes + étapes de la première connexion
  utils.ts            cn() et helpers
hooks/                logique de chaque écran (saisies, calendrier, vocal, envoi, session)
components/shared/    squelettes partagés (erreur, envoi, code oublié)
public/images/        assets (brand/, icons/…)
docs/adr/             décisions d'architecture
pinterest-captures/   références visuelles (MCP Pinterest, non versionné)
```

## Comptes de démo

| Numéro | Code | Cas |
|---|---|---|
| 77 123 45 67 | 1234 | congé accepté |
| 77 234 56 78 | 1234 | congé refusé |
| 78 345 67 89 | 1234 | pas de décision |
| 76 456 78 90 | — | première connexion : photo, puis on choisit son code et on le confirme |
| 70 567 89 01 | — | code remis à zéro par le salon : on choisit son code et on le confirme, sans la photo |

Code oublié : taper 3 codes faux (ou « J'ai oublié mon code ») envoie un lien par SMS (simulé : une notification « Démo » s'affiche, la toucher ouvre le lien), ou propose Face ID / l'empreinte si l'appareil l'a activée pour ce compte.

Une session reste valable 30 jours. Face ID / empreinte et le micro (vocal du congé) exigent un contexte sécurisé : sur le téléphone, lancer `npx next dev --experimental-https` (certificat auto-signé) ou passer par un déploiement.

Remettre la démo à zéro : `localStorage.removeItem("collaborateur-bco")` dans la console.
