# Collaborateur — Beauty and Co

Web app mobile destinée aux collaborateur·rices de Beauty and Co — même marque que [b&co](../b&co) et [point-de-vente](../point-de-vente), dont ce projet réutilise les tokens (couleurs, polices, logo).

**Front-end uniquement** : aucun backend. Toutes les données (collaborateur, réponses aux demandes) sont fictives et passent par une couche isolée `lib/api`, pour pouvoir brancher la vraie API plus tard sans toucher aux écrans.

## Principe UX : utilisable sans savoir lire

Une partie des collaborateurs ne lit pas. Chaque écran porte **une seule décision**, reconnaissable sans texte : icône, photo, couleur, chiffres (compris même sans savoir lire), vibration. Les libellés restent courts mais explicites (« Demander un congé » plutôt que « Congé »).
- **Saisie automatique** : une saisie de chiffres part toute seule dès qu'elle est complète (numéro à 9 chiffres, code à 4). Il n'y a pas de bouton « Valider » à trouver.
- **Pas de texte libre** : on enregistre un vocal au lieu d'écrire.
- **Erreur** : voir ce terme.

## Sur ordinateur

L'app ne s'y affiche pas. Sur un grand écran avec souris (≥ 768px de large, sans écran tactile), un seul écran invite à **l'ouvrir sur le téléphone**, avec un QR de l'adresse à scanner à l'appareil photo. Une tablette tactile garde l'app.

## Architecture d'information

```
Connexion
 ├─ [Face ID / empreinte, si activé sur l'appareil] ──────────────────────────▶ Accueil
 ├─ numéro ── code secret ─────────────────────────────────────────────────────▶ Accueil
 │             └─ oublié (ou 3 codes faux) ─▶ Code secret oublié :
 │                  [Biométrie de l'appareil] ─▶ nouveau code ─▶ confirmation ─▶ Accueil
 │                  sinon (ou au choix) ─▶ lien par SMS ─▶ nouveau code ─▶ confirmation ─▶ Accueil
 └─ numéro (pas encore de code) ─▶ Première connexion :
      1. photo (sautée si le compte en a déjà une) ─▶ 2. code secret ─▶ 3. confirmation ─▶ [Biométrie ?] ─▶ Accueil

Accueil
 ├─ Code QR (en grand)
 ├─ Réponse au dernier congé : ✓ / ✗ + dates (rien tant qu'il n'y a pas de décision)
 ├─ ▶ Paramètres : Changer la photo · [Sécurité : Changer le code secret · Face ID / empreinte] · Se déconnecter
 ├─ ▶ Demander un congé : 1. calendrier (1er jour puis dernier) ─▶ 2. raison en vocal ─▶ Envoi
 └─ ▶ Demander une avance : montant ─▶ Envoi
```

## Language

**Collaborateur**:
La personne qui travaille au salon et utilise l'app sur son téléphone. Unique persona.
_Avoid_: Employé, Staff, Utilisateur

**Connexion**:
Elle se fait en deux temps : d'abord le numéro de téléphone (sans indicatif, 9 chiffres groupés `77 777 77 77`), puis le code secret. Si le compte n'a pas encore de code, le numéro mène directement à la **Première connexion** (pas de vérification par SMS). Il n'y a pas de code provisoire. Si la **Biométrie** est activée sur l'appareil, l'app s'ouvre directement sur l'écran Face ID / empreinte, avec « Utiliser mon numéro » en secours.
_Avoid_: Login, Identifiant

**Session**:
Une fois connecté, on le reste **30 jours** (`SESSION_DUREE_JOURS`) sans avoir à se reconnecter. Le délai est prolongé à chaque ouverture de l'app. Au-delà, on revient à la Connexion.

**Code secret**:
Exactement 4 chiffres. Le collaborateur le **définit lui-même** à la première connexion. Il se change dans Paramètres › Sécurité en 3 écrans : l'ancien code (vérifié dès qu'il est complet, ses points passent au vert), le nouveau, puis sa confirmation. Oublié : voir **Code secret oublié**.
_Avoid_: Mot de passe, PIN

**Code secret oublié**:
Proposé sous le code (« J'ai oublié mon code ») à la Connexion et dans « Changer le code secret », et **de lui-même après 3 codes faux de suite** (pas de lien à trouver). Un seul écran, une seule décision :
- si la **Biométrie** de l'appareil est celle du collaborateur : « Utiliser Face ID / l'empreinte », qui remplace l'ancien code. On choisit ensuite un nouveau code et on le confirme (2 écrans), puis on arrive à l'Accueil (ou on revient aux Paramètres). « Recevoir un lien par SMS » reste proposé dessous ;
- sinon, un **lien part tout de suite par SMS** au numéro du compte, sans rien avoir à toucher. L'écran montre le téléphone avec la bulle du SMS et le numéro en gros chiffres. « Renvoyer » est possible au bout de 30 s, et un nouvel envoi rend l'ancien lien inutilisable.

Le **lien** ouvre l'écran « Nouveau code » : choisir son code puis le confirmer (2 étapes), et on arrive à l'Accueil, connecté. Il ne sert qu'**une fois** et reste valable **30 minutes**. Un lien usé ou expiré affiche « Ce lien ne marche plus » et ramène à la Connexion pour en demander un autre. Sans backend, aucun SMS ne part : une notification « Démo » imite le SMS reçu, et la toucher ouvre le lien.
_Avoid_: Mot de passe oublié, Réinitialisation

**Code + confirmation**:
Créer un code et le confirmer se fait en **2 écrans**, comme partout ailleurs : « Choisissez votre code », puis « Tapez-le encore une fois » (icône différente, la barre de progression avance). Pour qu'on ne croie pas le premier code refusé, ses 4 points **passent au vert** avec une coche et une petite vibration, puis l'écran glisse vers la confirmation. Si les deux codes diffèrent, l'écran tremble, vibre et on revient au choix du code. Un **cadenas animé** raconte le parcours et reste en place d'un écran à l'autre : fermé pour le code actuel, il s'ouvre quand il est bon ; ouvert pour choisir le nouveau, il se change en deux flèches qui tournent pour la confirmation ; il redevient un cadenas qui se referme, en vert, quand c'est fini.

**Première connexion**:
Le parcours obligatoire de la toute première fois, avec une barre de progression en 3 étapes : 1. photo de profil (**obligatoire**, prise directement à la caméra frontale), 2. choisir son code secret, 3. le confirmer. Après un code remis à zéro par le salon, le compte a déjà sa photo : le parcours n'a que les 2 étapes du code. Ensuite, si l'appareil le permet, on propose la **Biométrie** (hors barre de progression). La photo et le code ne sont enregistrés qu'à la toute fin.
_Avoid_: Onboarding, Inscription

**Biométrie**:
Se connecter avec le moyen de déverrouillage du téléphone (Face ID, Touch ID, empreinte digitale) au lieu du numéro et du code. Elle est proposée à la fin de la Première connexion, et peut être activée ou désactivée dans Paramètres › Sécurité. Dans les deux cas, seulement si l'appareil la prend en charge. Le choix est **propre à l'appareil** : il est conservé après une déconnexion. Techniquement, c'est WebAuthn avec l'authentificateur intégré, qui exige HTTPS sur le téléphone (`next dev --experimental-https`). Le libellé (« Face ID » sur Apple, « l'empreinte digitale » sur Android) est déduit de l'appareil.
_Avoid_: Passkey

**Accueil**:
L'écran d'atterrissage, centré sur le **Code QR** affiché en grand. Il porte aussi la réponse au dernier congé, le **logo** Beauty and Co et l'accès aux Paramètres par la **photo** du collaborateur (elle dit « c'est mon code », et une pastille roue dentée montre qu'elle se touche). Sur un petit écran, ils forment une ligne d'en-tête au-dessus du QR (logo de 80px à gauche, photo à droite) ; sur un écran haut (≥ 800px), la photo est à cheval sur le bloc du QR comme sur une carte de salarié, et le logo s'affiche en grand dans le blanc du haut. Le **QR est prioritaire** : sur un écran de moins de 700px de haut, les tuiles des demandes se font compactes pour lui laisser la place et les deux demandes (grandes tuiles illustrées de même intensité, rose de marque adouci (85 %) pour « Demander un congé », rose doux de marque (`#eddcda`) pour « Demander une avance » ; la couleur de chaque demande la suit sur ses écrans). Pas de prénom ni de message de bienvenue.
_Avoid_: Dashboard, Home, Tableau de bord

**Code QR**:
Le QR propre au collaborateur, qu'il montre pour son **Pointage**. Le scan se fait sur la plateforme existante, hors scope de ce projet. Le QR contient l'`id` du collaborateur, le même que `Praticienne.id` de point-de-vente, dont le scanner compare la valeur lue à cet id : les deux apps fonctionnent ensemble telles quelles.

**Pointage**:
L'arrivée ou le départ d'un collaborateur au salon, pris en scannant son Code QR. C'est le même terme que dans point-de-vente.
_Avoid_: Check-in, check-out, badgeage

**Demande de congé**:
Elle se fait en 2 écrans (barre de progression), construits comme l'Avance : la valeur en grand au milieu, de quoi la saisir en bas, dans le rose du congé.
1. **Un seul calendrier** : on touche le premier jour, puis le dernier. Pas de champs « début » et « fin » à lire : au-dessus du calendrier, deux pastilles taupe montrent les jours choisis (« 20 → 24 », le mois dessous) et le **nombre de jours**. Tant qu'un jour manque, son rond en pointillés « respire » pour montrer lequel toucher. Sur le calendrier (des tuiles blanches dans un bloc rose doux, comme celui du QR), le premier et le dernier jour sont en taupe, les jours entre les deux en rose de marque, et les jours passés sont grisés. Un seul jour touché suffit pour continuer : c'est un congé d'un jour. Sur un écran de moins de 700px de haut, le récapitulatif tient sur une ligne pour qu'un mois de 6 semaines tienne sans défiler.
2. **La raison, en vocal** : les dates en rappel, puis un gros **micro rose** à toucher pour parler et à retoucher pour arrêter (60 s au plus). Pendant l'enregistrement, il passe en taupe avec un carré « stop », un halo suit la voix et un anneau se remplit jusqu'à 60 s. Une fois enregistré, le vocal devient une **note vocale** comme sur WhatsApp (lecture, forme d'onde, durée), avec « Recommencer » sous « Envoyer ».

Ensuite, « Envoyer » mène à l'**Envoi**. Aucun statut n'apparaît ensuite et il n'y a pas d'historique. La réponse ne peut être que **Accepté** ou **Refusé** (jamais « en attente »). L'Accueil affiche la réponse à la **dernière** demande dès qu'elle tombe, **en une phrase** : la décision d’abord (« Votre congé est accepté. »), les dates dessous (« Du 20 au 24 octobre »), précédée d'une icône ✓ verte ou ✗ rouge. Elle est dans une **Bulle** gris clair qui arrive par le bas puis fait un petit aller-retour pour montrer qu'on peut la faire glisser. On la **ferme** avec la croix ou en la faisant glisser sur le côté, et elle ne reparaît plus (même après avoir rouvert l'app). Rien ne s'affiche tant qu'il n'y a pas de décision.
_Avoid_: Absence, Vacances

**Avance sur salaire**:
Seulement un montant en francs CFA (seule devise possible, donc pas de sélecteur), affiché en très grand, saisi au pavé numérique (7 chiffres au plus) ou choisi parmi 4 montants rapides (5 000, 10 000, 25 000, 50 000). L'écran reprend la liasse de billets et le rose doux de sa tuile. Pas de plafond affiché ni de raison. « Envoyer » mène à l'**Envoi**, puis rien : pas de réponse ni d'historique dans l'app.
_Avoid_: Acompte (terme réservé à point-de-vente, qui désigne un paiement client), Prêt

**Bulle**:
Notification gris clair de l'Accueil (pour l'instant, la réponse au dernier congé). Elle s'insère sous le QR, qui remonte pour lui faire place : les tuiles des demandes ne bougent jamais. Elle se ferme d'une croix ou en la faisant glisser sur le côté, et une bulle fermée ne reparaît plus.
_Avoid_: Toast, Alerte, Notification push

**Envoi**:
L'écran qui suit l'envoi d'une demande (congé ou avance). La demande est **envoyée, pas acceptée** : il n'y a donc ni vert ni coche, réservés à la réponse « Accepté ». C'est un écran plein, sans rien derrière : un rond dans la couleur de la demande (rose pour le congé, rose doux pour l'avance) monte du bas et rebondit. Un **avion en papier** en sort vers le haut en laissant une traînée en pointillés, puis un **sablier** apparaît dans le rond et se retourne en boucle, pour dire que la réponse viendra plus tard. Dessous : « Demande envoyée », sans les dates ni le montant. Une vibration, **pas de son**. Retour automatique à l'Accueil (environ 3 s), ou plus tôt en touchant l'écran.
_Avoid_: Succès, Toast

**Erreur**:
Elle se montre et se ressent sans texte : l'écran **tremble**, le téléphone **vibre** (pas sur iPhone, où Safari ne le permet pas), une couleur rouge et un **picto propre à l'erreur** (`Erreur.code` : numéro inconnu → aller voir le salon, code faux, micro refusé…). Le message texte reste disponible pour les lecteurs d'écran.

**Paramètres**:
Un seul écran, sans sous-menu : sa photo en tête (on la touche pour la changer ; une pastille appareil photo le montre), la rubrique **Sécurité**, puis « Se déconnecter » en bas (**sans confirmation**). Changer la photo : la photo en grand, « Prendre une photo » (caméra frontale), puis « Enregistrer » ou « Reprendre ».
_Avoid_: Réglages, Mon compte

**Sécurité**:
Une **rubrique** de l'écran Paramètres, pas un écran à part : changer le code secret, et activer ou désactiver la Biométrie (seulement si l'appareil la prend en charge).
_Avoid_: Confidentialité, Compte
