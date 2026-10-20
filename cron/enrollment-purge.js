#!/usr/bin/env node
/**
 * Appelle l'API de purge des dossiers d'inscription en corbeille (≥ 30 jours).
 *
 * Usage (cPanel Cron Jobs) :
 *   /usr/bin/node /chemin/vers/Scolitrack/cron/enrollment-purge.js
 *
 * Prérequis : renseigner cron/config.env (voir config.env.exemple).
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

function loadConfigEnv() {
  const configPath = path.join(__dirname, "config.env");
  if (!fs.existsSync(configPath)) {
    return {};
  }
  const out = {};
  for (const line of fs.readFileSync(configPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const fileConfig = loadConfigEnv();
const appUrl = (
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  fileConfig.APP_URL ||
  ""
).replace(/\/$/, "");
const secret = process.env.CRON_SECRET || fileConfig.CRON_SECRET || "";

if (!appUrl) {
  console.error(
    "[enrollment-purge] APP_URL manquant. Renseignez cron/config.env (voir config.env.exemple)."
  );
  process.exit(1);
}
if (!secret) {
  console.error(
    "[enrollment-purge] CRON_SECRET manquant. Renseignez cron/config.env (voir config.env.exemple)."
  );
  process.exit(1);
}

const url = new URL(`${appUrl}/api/cron/enrollment-purge`);
const transport = url.protocol === "https:" ? https : http;

const req = transport.request(
  url,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secret}`,
      Accept: "application/json",
      "User-Agent": "Scolitrack-cPanel-Cron/1.0",
    },
    timeout: 60_000,
  },
  (res) => {
    let body = "";
    res.on("data", (chunk) => {
      body += chunk;
    });
    res.on("end", () => {
      const ok = res.statusCode >= 200 && res.statusCode < 300;
      console.log(
        `[enrollment-purge] HTTP ${res.statusCode} ${ok ? "OK" : "ERREUR"}`
      );
      if (body) {
        try {
          console.log(JSON.stringify(JSON.parse(body), null, 2));
        } catch {
          console.log(body);
        }
      }
      process.exit(ok ? 0 : 1);
    });
  }
);

req.on("timeout", () => {
  console.error("[enrollment-purge] Délai dépassé (60s)");
  req.destroy();
  process.exit(1);
});

req.on("error", (err) => {
  console.error("[enrollment-purge] Échec de la requête:", err.message);
  process.exit(1);
});

req.end();
