# Tâches planifiées (cPanel)

Purge quotidienne des dossiers d’inscription mis en corbeille depuis **30 jours**.  
L’application Next.js doit être **démarrée** (l’API `/api/cron/enrollment-purge` fait le travail).

## 1. Préparer le secret

Dans le `.env` de l’application :

```env
CRON_SECRET=une_clé_longue_et_aléatoire
```

Puis dans ce dossier :

```bash
cp config.env.exemple config.env
```

Éditez `config.env` :

```env
APP_URL=https://votredomaine.fr
CRON_SECRET=une_clé_longue_et_aléatoire
```

`CRON_SECRET` doit être **identique** dans `.env` et `cron/config.env`.  
Ne committez pas `config.env`.

## 2. Tester à la main

Depuis le serveur (SSH ou Terminal cPanel), à la racine du projet ou avec le chemin absolu :

```bash
# Option A — Node (recommandé)
node /chemin/absolu/vers/Scolitrack/cron/enrollment-purge.js

# Option B — curl / bash
bash /chemin/absolu/vers/Scolitrack/cron/enrollment-purge.sh
```

Réponse attendue : HTTP 200 et un JSON du type `{ "purged": 0, "ids": [] }` (ou le nombre de dossiers purgés).

## 3. Brancher dans cPanel → Cron Jobs

1. cPanel → **Cron Jobs** (Tâches Cron).
2. Fréquence : **une fois par jour** (ex. tous les jours à 3h00).
3. Commande (choisir **une** des deux) :

**Node :**

```text
/usr/bin/node /home/VOTRE_USER/chemin/vers/Scolitrack/cron/enrollment-purge.js >> /home/VOTRE_USER/logs/enrollment-purge.log 2>&1
```

**Bash + curl** (si Node n’est pas dans le PATH du cron) :

```text
/bin/bash /home/VOTRE_USER/chemin/vers/Scolitrack/cron/enrollment-purge.sh >> /home/VOTRE_USER/logs/enrollment-purge.log 2>&1
```

Remplacez :

- `VOTRE_USER` / le chemin par ceux de votre hébergement ;
- `/usr/bin/node` par le chemin réel (`which node` en SSH, parfois `/opt/cpanel/ea-nodejs20/bin/node`).

Créez le dossier de logs si besoin : `mkdir -p ~/logs`.

### Exemple de planification cPanel

| Minute | Heure | Jour | Mois | Semaine |
|--------|-------|------|------|---------|
| 0      | 3     | *    | *    | *       |

→ tous les jours à 03:00 (heure du serveur).

## 4. Vérifications

| Symptôme | Cause probable |
|----------|----------------|
| `CRON_SECRET manquant` | `config.env` absent ou incomplet |
| HTTP 401 | Secret différent entre `.env` app et `config.env` |
| Connexion refusée / timeout | App Next.js arrêtée, mauvaise `APP_URL`, ou firewall |
| HTTP 500 `CRON_SECRET non configuré` | Variable absente du `.env` de l’app (redémarrer Node après ajout) |

## Fichiers

| Fichier | Rôle |
|---------|------|
| `enrollment-purge.js` | Script Node appelé par le cron |
| `enrollment-purge.sh` | Variante curl |
| `config.env.exemple` | Modèle de config |
| `config.env` | Config locale (à créer, non versionnée) |
