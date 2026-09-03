import { compressImage, MAX_UPLOAD_BYTES } from "@/lib/imageCompression";
import { uploadAdminImageAction } from "@/app/admin/actions";
import { auth } from "@/lib/firebase/config";

/**
 * Le SEUL chemin d'envoi d'une image, pour toute l'application.
 *
 * Il y en avait deux, et ils avaient divergé. Le gestionnaire de photos
 * compressait, bornait la taille et affichait une erreur lisible ; le
 * formulaire d'administration historique envoyait le fichier BRUT, sans
 * compression ni garde-fou. Une photo prise sur un Mac ou un téléphone pèse
 * 3 à 12 Mo : elle dépassait la limite de corps des Server Actions, et
 * l'erreur remontait en « An error occurred in the Server Components
 * render » — un message qui ne dit rien à personne.
 *
 * Trois choses ici, dans cet ordre :
 *  1. COMPRESSION. Elle ramène une photo de 12 Mo sous les 500 Ko sans perte
 *     visible : le livret ne l'affiche jamais au-delà de 1600 px.
 *  2. GARDE-FOU. Ce qui dépasse encore est refusé AVANT le réseau, avec un
 *     message qui nomme le fichier.
 *  3. JETON. Celui de l'hôte accompagne l'envoi : l'action accepte le cookie
 *     de Guidz ou ce jeton, et un client doit pouvoir envoyer ses propres
 *     photos.
 */

/** Formate un poids en mégaoctets, pour un message lisible. */
function enMo(octets: number): string {
  return (octets / 1048576).toFixed(1).replace(".", ",");
}

export async function envoyerImage(fichier: File, dossier: string): Promise<string> {
  if (!fichier.type.startsWith("image/")) {
    throw new Error(`« ${fichier.name} » n’est pas une image.`);
  }

  const compresse = await compressImage(fichier);

  if (compresse.size > MAX_UPLOAD_BYTES) {
    /*
     * Le cas typique : un fichier HEIC d'iPhone ou de Mac, que les
     * navigateurs autres que Safari ne savent pas décoder — la compression
     * renonce alors et renvoie l'original. On le dit, plutôt que de laisser
     * le serveur refuser un envoi de 9 Mo sans expliquer pourquoi.
     */
    const heic = /heic|heif/i.test(fichier.type) || /\.hei[cf]$/i.test(fichier.name);
    throw new Error(
      heic
        ? `« ${fichier.name} » est au format HEIC, que votre navigateur ne sait pas convertir. Exportez-la en JPEG, ou réessayez depuis Safari.`
        : `« ${fichier.name} » pèse encore ${enMo(compresse.size)} Mo après compression, au-delà de la limite de ${enMo(MAX_UPLOAD_BYTES)} Mo. Réduisez-la avant de l’envoyer.`
    );
  }

  const corps = new FormData();
  corps.append("file", compresse);

  // Absent côté Guidz, qui s'authentifie par son cookie : sans effet pour lui.
  const jeton = await auth.currentUser?.getIdToken().catch(() => undefined);

  return uploadAdminImageAction(corps, dossier, jeton);
}
