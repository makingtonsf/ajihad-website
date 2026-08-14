import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { protegerPreversion } from "./previewAuth";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerSitemapRoute } from "../routes/sitemap";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { bloquerIndexationEphemere } from "./domaineEphemere";
import { authentifierRequete } from "./auth";
import { cheminPieceJointe } from "./candidatureFiles";
import { peutAccederAdmin } from "@shared/roles";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Tout en haut : une adresse temporaire (tunnel, préversion, local) ne doit
  // jamais être indexée. L'en-tête couvre aussi les robots sans JavaScript,
  // que la balise <meta> posée au rendu ne touche pas.
  app.use(bloquerIndexationEphemere);
  // Le verrou vient juste après les parseurs — il lit le corps du formulaire
  // de mot de passe — mais avant toute route applicative. Il ne cible que
  // /admin, /espace-membre et les procédures admin.*/membre.*.
  protegerPreversion(app);
  // SEO : sitemap.xml + robots.txt, avant le middleware Vite/statique
  registerSitemapRoute(app);
  // Les CV et photos de candidature sont privés : ils ne sont jamais servis
  // par un dossier statique public. Chaque lecture vérifie la session admin.
  app.get("/api/admin/candidatures/files/:nom", async (req, res) => {
    const utilisateur = await authentifierRequete(req);
    if (!utilisateur || !peutAccederAdmin(utilisateur.role)) {
      res.status(403).json({ message: "Accès réservé aux administrateurs." });
      return;
    }
    const chemin = cheminPieceJointe(req.params.nom);
    if (!chemin) {
      res.status(404).json({ message: "Pièce jointe introuvable." });
      return;
    }
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Content-Disposition", "inline");
    res.sendFile(chemin, erreur => {
      // @ts-expect-error Express enrichit cette erreur avec statusCode.
      if (erreur && !res.headersSent) res.status(erreur.statusCode === 404 ? 404 : 500).json({ message: "Pièce jointe introuvable." });
    });
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite unless the compiled frontend is explicitly
  // requested for isolated local API tests.
  if (process.env.NODE_ENV === "development" && process.env.DISABLE_VITE !== "1") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  const listenHost = process.env.LOCAL_ONLY === "1" ? "127.0.0.1" : undefined;
  const onListening = () => {
    console.log(`Server running on http://localhost:${port}/`);
  };
  if (listenHost) server.listen(port, listenHost, onListening);
  else server.listen(port, onListening);
}

startServer().catch(console.error);
