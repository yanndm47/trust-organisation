// ZETA ORG — TRUST ORGANISATION academic platform
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

const ROOT = __dirname;
const UPLOADS = path.join(ROOT, "uploads");
fs.mkdirSync(UPLOADS, { recursive: true });
const db = new DatabaseSync(path.join(ROOT, "trust.sqlite"));
db.exec(`PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE, level TEXT, field TEXT, course TEXT, sex TEXT, password_hash TEXT NOT NULL, is_admin INTEGER NOT NULL DEFAULT 0, first_download_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS documents (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, type TEXT NOT NULL, level TEXT NOT NULL, field TEXT NOT NULL, subject TEXT NOT NULL, file_url TEXT NOT NULL, size TEXT DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS news (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, category TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS downloads (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, document_id INTEGER NOT NULL, phone TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires_at INTEGER NOT NULL);
`);
const newsColumns = db.prepare("PRAGMA table_info(news)").all().map(column => column.name);
if (!newsColumns.includes("image_url")) db.exec("ALTER TABLE news ADD COLUMN image_url TEXT DEFAULT ''");
db.exec("CREATE TABLE IF NOT EXISTS fields (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)");
const ADMIN_PHONE = "696178436";
const ADMIN_PASSWORD = "@Ecoecco227@";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "https://trust-organisation.vercel.app";
const CORS_ORIGINS = new Set(CORS_ORIGIN.split(",").map(origin => origin.trim()).filter(Boolean).concat(["http://localhost:5500", "http://127.0.0.1:5500"]));
function passwordHash(password) { return crypto.scryptSync(password, "trust-organisation-salt", 64).toString("hex"); }
if (!db.prepare("SELECT id FROM users WHERE phone = ?").get(ADMIN_PHONE)) db.prepare("INSERT INTO users (name, phone, password_hash, is_admin, level, field, course, sex) VALUES (?, ?, ?, 1, ?, ?, ?, ?)").run("Administrateur TRUST", ADMIN_PHONE, passwordHash(ADMIN_PASSWORD), "—", "Administration", "Organisation", "—");
const sessions = new Map();
function applyCors(req, res) { const origin = req.headers.origin; if (origin && CORS_ORIGINS.has(origin)) { res.setHeader("Access-Control-Allow-Origin", origin); res.setHeader("Access-Control-Allow-Credentials", "true"); res.setHeader("Vary", "Origin"); } }
function send(res, status, body, headers = {}) { res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers }); res.end(JSON.stringify(body)); }
function parseCookies(req) { return Object.fromEntries((req.headers.cookie || "").split(";").filter(Boolean).map(item => item.trim().split("="))); }
function currentUser(req) { const token = parseCookies(req).trust_session; if (!token) return null; const session = sessions.get(token); if (!session || session.expires < Date.now()) return null; return db.prepare("SELECT id, name, phone, level, field, course, sex, is_admin AS isAdmin, first_download_at AS firstDownloadAt FROM users WHERE id = ?").get(session.userId); }
function requireAdmin(req, res) { const user = currentUser(req); if (!user || !user.isAdmin) { send(res, 403, { error: "Accès administrateur requis." }); return null; } return user; }
function body(req) { return new Promise((resolve, reject) => { let data = ""; req.on("data", chunk => { data += chunk; if (data.length > 35 * 1024 * 1024) { reject(new Error("Payload trop volumineux.")); req.destroy(); } }); req.on("end", () => { try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error("JSON invalide.")); } }); req.on("error", reject); }); }
function safeUser(user) { return user ? { ...user, isAdmin: Boolean(user.isAdmin) } : null; }
function bootstrap(req) { const user = currentUser(req); const documents = db.prepare("SELECT id, title, type, level, field, subject, file_url AS fileUrl, size, strftime('%d/%m/%Y', created_at) AS date FROM documents ORDER BY id DESC").all(); const news = db.prepare("SELECT id, title, category, content, image_url AS imageUrl, strftime('%d/%m/%Y', created_at) AS created_at FROM news ORDER BY id DESC").all(); const stats = { users: db.prepare("SELECT COUNT(*) AS count FROM users WHERE is_admin = 0").get().count, downloads: db.prepare("SELECT COUNT(*) AS count FROM downloads").get().count }; const accounts = user?.isAdmin ? db.prepare("SELECT id, name, phone, level, field FROM users WHERE is_admin = 0 ORDER BY id DESC").all() : []; const fields = db.prepare("SELECT id, name FROM fields ORDER BY name COLLATE NOCASE").all(); return { user: safeUser(user), documents, news, stats, accounts, fields }; }
async function route(req, res) {
  const url = new URL(req.url, "http://localhost"); const pathname = url.pathname;
  applyCors(req, res);
  if (req.method === "GET" && pathname === "/health") return send(res, 200, { ok: true });
  if (req.method === "OPTIONS" && pathname.startsWith("/api/")) return send(res, 204, {}, { "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" });
  if (pathname.startsWith("/api/")) {
    try {
      if (req.method === "GET" && pathname === "/api/bootstrap") return send(res, 200, bootstrap(req));
      if (req.method === "POST" && pathname === "/api/auth/register") { const data = await body(req); const phone = String(data.phone || "").replace(/\s+/g, ""); if (!data.name?.trim() || !phone || !data.password || data.password.length < 8 || !["1", "2", "3", "4", "5"].includes(String(data.level)) || !data.course || !data.sex) return send(res, 400, { error: "Renseignez tous les champs. Le mot de passe doit contenir au moins 8 caractères et le niveau doit être compris entre 1 et 5." }); const result = db.prepare("INSERT INTO users (name, phone, level, field, course, sex, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)").run(data.name.trim(), phone, String(data.level), String(data.field || "").trim(), data.course, data.sex, passwordHash(data.password)); const user = db.prepare("SELECT id, name, phone, level, field, course, sex, is_admin AS isAdmin FROM users WHERE id = ?").get(result.lastInsertRowid); return createSession(res, user, req); }
      if (req.method === "POST" && pathname === "/api/auth/login") { const data = await body(req); const phone = String(data.phone || "").replace(/\s+/g, ""); if (!phone || typeof data.password !== "string") return send(res, 400, { error: "Le numéro et le mot de passe sont requis." }); const user = db.prepare("SELECT id, name, phone, level, field, course, sex, is_admin AS isAdmin, password_hash FROM users WHERE phone = ?").get(phone); if (!user || !crypto.timingSafeEqual(Buffer.from(user.password_hash, "hex"), Buffer.from(passwordHash(data.password), "hex"))) return send(res, 401, { error: "Numéro ou mot de passe incorrect." }); delete user.password_hash; return createSession(res, user, req); }
      if (req.method === "POST" && pathname === "/api/auth/logout") { const token = parseCookies(req).trust_session; sessions.delete(token); return send(res, 200, { ok: true }, { "Set-Cookie": "trust_session=; Max-Age=0; HttpOnly; SameSite=Lax; Path=/" }); }
      if (req.method === "POST" && pathname === "/api/profile/download-details") {
        const data = await body(req);
        if (!data.name || !data.phone || !data.documentId) return send(res, 400, { error: "Le nom, le téléphone et le document sont requis." });
        const loggedUser = currentUser(req);
        let user = loggedUser;
        if (!user) {
          user = db.prepare("SELECT id, name, phone FROM users WHERE phone = ?").get(data.phone);
          if (!user) {
            const result = db.prepare("INSERT INTO users (name, phone, password_hash, first_download_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)").run(data.name, data.phone, passwordHash(crypto.randomBytes(24).toString("hex")));
            user = { id: result.lastInsertRowid, name: data.name, phone: data.phone, isAdmin: false };
          } else {
            db.prepare("UPDATE users SET name = ?, first_download_at = COALESCE(first_download_at, CURRENT_TIMESTAMP) WHERE id = ?").run(data.name, user.id);
          }
        } else {
          db.prepare("UPDATE users SET first_download_at = COALESCE(first_download_at, CURRENT_TIMESTAMP), name = ?, phone = ? WHERE id = ?").run(data.name, data.phone, user.id);
        }
        db.prepare("INSERT INTO downloads (user_id, document_id, phone) VALUES (?, ?, ?)").run(user.id, data.documentId, data.phone);
        if (!loggedUser) return createSession(res, { ...user, isAdmin: false }, req);
        return send(res, 200, { ok: true });
      }
      if (req.method === "POST" && pathname === "/api/documents") { requireAdmin(req, res) || (() => { throw new Error("AUTH_STOP"); })(); const data = await body(req); if (!data.title || !data.fileData || !data.fileName) return send(res, 400, { error: "Un fichier est requis." }); const safeName = `${Date.now()}-${path.basename(data.fileName).replace(/[^a-zA-Z0-9._-]/g, "_")}`; fs.writeFileSync(path.join(UPLOADS, safeName), Buffer.from(data.fileData, "base64")); db.prepare("INSERT INTO documents (title, type, level, field, subject, file_url, size) VALUES (?, ?, ?, ?, ?, ?, ?)").run(data.title, data.type, data.level, data.field, data.subject, `/uploads/${safeName}`, data.size || ""); return send(res, 201, { ok: true }); }
      if (req.method === "DELETE" && pathname.match(/^\/api\/documents\/\d+$/)) { requireAdmin(req, res) || (() => { throw new Error("AUTH_STOP"); })(); db.prepare("DELETE FROM documents WHERE id = ?").run(Number(pathname.split("/").pop())); return send(res, 200, { ok: true }); }
      if (req.method === "POST" && pathname === "/api/news") { requireAdmin(req, res) || (() => { throw new Error("AUTH_STOP"); })(); const data = await body(req); if (!data.title || !data.category || !data.content) return send(res, 400, { error: "Le titre, la catégorie et le contenu sont requis." }); let imageUrl = ""; if (data.imageData && data.imageName) { const safeName = `${Date.now()}-${path.basename(data.imageName).replace(/[^a-zA-Z0-9._-]/g, "_")}`; fs.writeFileSync(path.join(UPLOADS, safeName), Buffer.from(data.imageData, "base64")); imageUrl = `/uploads/${safeName}`; } db.prepare("INSERT INTO news (title, category, content, image_url) VALUES (?, ?, ?, ?)").run(data.title, data.category, data.content, imageUrl); return send(res, 201, { ok: true }); }
      if (req.method === "DELETE" && pathname.match(/^\/api\/news\/\d+$/)) { requireAdmin(req, res) || (() => { throw new Error("AUTH_STOP"); })(); db.prepare("DELETE FROM news WHERE id = ?").run(Number(pathname.split("/").pop())); return send(res, 200, { ok: true }); }
      if (req.method === "POST" && pathname === "/api/fields") { requireAdmin(req, res) || (() => { throw new Error("AUTH_STOP"); })(); const data = await body(req); if (!data.name?.trim()) return send(res, 400, { error: "Le nom de la filière est requis." }); db.prepare("INSERT INTO fields (name) VALUES (?)").run(data.name.trim()); return send(res, 201, { ok: true }); }
      if (req.method === "DELETE" && pathname.match(/^\/api\/fields\/\d+$/)) { requireAdmin(req, res) || (() => { throw new Error("AUTH_STOP"); })(); db.prepare("DELETE FROM fields WHERE id = ?").run(Number(pathname.split("/").pop())); return send(res, 200, { ok: true }); }
      if (req.method === "DELETE" && pathname.match(/^\/api\/users\/\d+$/)) { requireAdmin(req, res) || (() => { throw new Error("AUTH_STOP"); })(); const userId = Number(pathname.split("/").pop()); db.prepare("DELETE FROM downloads WHERE user_id = ?").run(userId); db.prepare("DELETE FROM users WHERE id = ? AND is_admin = 0").run(userId); return send(res, 200, { ok: true }); }
      if (req.method === "POST" && pathname.match(/^\/api\/documents\/\d+\/download$/)) { const user = currentUser(req); const docId = Number(pathname.split("/")[3]); if (!user || !user.firstDownloadAt) return send(res, 200, { requiresDetails: true }); db.prepare("INSERT INTO downloads (user_id, document_id, phone) VALUES (?, ?, ?)").run(user.id, docId, user.phone); return send(res, 200, { url: `/api/documents/${docId}/file` }); }
      if (req.method === "GET" && pathname.match(/^\/api\/documents\/\d+\/file$/)) { const user = currentUser(req); if (!user) return send(res, 401, { error: "Connexion requise." }); const doc = db.prepare("SELECT file_url AS fileUrl FROM documents WHERE id = ?").get(Number(pathname.split("/")[3])); if (!doc) return send(res, 404, { error: "Document introuvable." }); if (doc.fileUrl.startsWith("/uploads/")) { const uploaded = path.join(ROOT, doc.fileUrl.slice(1)); if (!uploaded.startsWith(UPLOADS) || !fs.existsSync(uploaded)) return send(res, 404, { error: "Fichier introuvable." }); return fs.createReadStream(uploaded).pipe(res); } res.writeHead(302, { Location: doc.fileUrl }); return res.end(); }
      return send(res, 404, { error: "Route introuvable." });
    } catch (error) { if (error.message === "AUTH_STOP") return; if (error.code === "SQLITE_CONSTRAINT_UNIQUE" || error.code === "ERR_SQLITE_ERROR" && error.errcode === 2067) return send(res, 409, { error: "Ce numéro de téléphone est déjà enregistré. Utilisez un autre numéro ou connectez-vous." }); console.error(error); return send(res, 500, { error: "Erreur interne du serveur. Réessayez avec des informations valides." }); }
  }
  const file = pathname === "/" ? "index.html" : pathname.slice(1); const filePath = path.join(ROOT, file); if (!filePath.startsWith(ROOT) || filePath.startsWith(UPLOADS) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return send(res, 404, { error: "Fichier introuvable." }); const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg" }; res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" }); fs.createReadStream(filePath).pipe(res);
}
function createSession(res, user, req) { const token = crypto.randomBytes(32).toString("hex"); sessions.set(token, { userId: user.id, expires: Date.now() + 8 * 60 * 60 * 1000 }); const crossSite = Boolean(req?.headers.origin && !req.headers.origin.includes("localhost") && !req.headers.origin.includes("127.0.0.1")); const sameSite = crossSite ? "SameSite=None; Secure" : "SameSite=Lax"; send(res, 200, { user: safeUser(user) }, { "Set-Cookie": `trust_session=${token}; HttpOnly; ${sameSite}; Path=/; Max-Age=28800` }); }
http.createServer(route).listen(process.env.PORT || 5500, () => console.log(`TRUST ORGANISATION disponible sur http://localhost:${process.env.PORT || 5500}`));
