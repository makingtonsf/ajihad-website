import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";

export type TypePieceJointe = "cv" | "photo";

export type PieceJointeEntree = {
  data: string;
  name: string;
  size: number;
  type: string;
};

const LIMITES: Record<TypePieceJointe, number> = {
  cv: 5 * 1024 * 1024,
  photo: 3 * 1024 * 1024,
};

const MIME_AUTORISES: Record<TypePieceJointe, string[]> = {
  cv: ["application/pdf"],
  photo: ["image/jpeg", "image/png", "image/webp"],
};

export const repertoirePieces = () => path.resolve(
  process.env.UPLOADS_DIR ?? path.resolve(process.cwd(), "uploads", "candidatures")
);

function extensionPour(mime: string): string {
  return mime === "application/pdf" ? "pdf" : mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
}

function signatureValide(type: TypePieceJointe, contenu: Buffer): boolean {
  if (type === "cv") return contenu.subarray(0, 5).toString("ascii") === "%PDF-";
  const jpeg = contenu.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  const png = contenu.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const webp = contenu.subarray(0, 4).toString("ascii") === "RIFF" && contenu.subarray(8, 12).toString("ascii") === "WEBP";
  return jpeg || png || webp;
}

export async function sauvegarderPieceJointe(piece: PieceJointeEntree | undefined, type: TypePieceJointe) {
  if (!piece) return null;
  if (!MIME_AUTORISES[type].includes(piece.type)) {
    throw new Error(type === "cv" ? "Le CV doit être un fichier PDF." : "La photo doit être au format JPG, PNG ou WebP.");
  }
  if (!Number.isFinite(piece.size) || piece.size <= 0 || piece.size > LIMITES[type]) {
    throw new Error(type === "cv" ? "Le CV ne doit pas dépasser 5 Mo." : "La photo ne doit pas dépasser 3 Mo.");
  }
  const correspondance = /^data:([^;]+);base64,([A-Za-z0-9+/=\r\n]+)$/.exec(piece.data);
  if (!correspondance || correspondance[1] !== piece.type) throw new Error("La pièce jointe est invalide.");
  const contenu = Buffer.from(correspondance[2].replace(/\s/g, ""), "base64");
  if (contenu.length !== piece.size || !signatureValide(type, contenu)) throw new Error("Le contenu de la pièce jointe est invalide.");

  const nom = `${nanoid(24)}.${extensionPour(piece.type)}`;
  const dossier = repertoirePieces();
  await fs.mkdir(dossier, { recursive: true });
  await fs.writeFile(path.join(dossier, nom), contenu, { flag: "wx" });
  return { url: `/api/admin/candidatures/files/${nom}`, nom: piece.name.slice(0, 255), taille: contenu.length };
}

export function cheminPieceJointe(nom: string): string | null {
  if (!/^[A-Za-z0-9_-]+\.(pdf|jpg|jpeg|png|webp)$/i.test(nom)) return null;
  const dossier = repertoirePieces();
  const chemin = path.resolve(dossier, nom);
  return chemin.startsWith(`${dossier}${path.sep}`) ? chemin : null;
}
