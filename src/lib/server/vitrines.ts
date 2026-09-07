import "server-only";

import { resolveAccommodation } from "@/lib/firebase/admin-firestore";
import { resolveGallery } from "@/lib/livret";
import { Accommodation } from "@/lib/types/accommodation";
import { LIVRETS_DEMO, VitrineGarnie } from "@/lib/livretsDemo";

/**
 * Les vitrines, garnies avec le contenu réel des livrets.
 *
 * La photo et le nom étaient écrits en dur à côté du livret. Ils dérivaient :
 * la vignette de Marseille montrait une image que le livret n'avait pas, et
 * celle de Paris une maison là où la page annonce un appartement. Le visiteur
 * ne trouvait pas derrière le lien ce que la carte lui avait promis.
 *
 * On lit donc le livret avec resolveAccommodation, qui gère la lecture par slug,
 * par identifiant Firestore, et le repli démo.
 */

function accueilEssentiel(livret: Accommodation): string {
  const ecrit = livret.property?.welcomeMessage?.trim();
  if (ecrit) return ecrit;
  return `${livret.property?.name || "Votre logement"} — vous trouverez ici toutes les informations utiles pour votre séjour.`;
}

export async function chargerVitrines(): Promise<VitrineGarnie[]> {
  const vitrines = await Promise.all(
    LIVRETS_DEMO.map(async (vitrine) => {
      try {
        const livret = await resolveAccommodation(vitrine.slug);
        if (!livret) return vitrine;

        const estConfort = vitrine.formule === "Confort";
        const gallery = resolveGallery(livret.property);
        const photo = gallery[0] || livret.property?.mainImageUrl || livret.property?.gallery?.[0];

        return {
          ...vitrine,
          nom: livret.property?.name || vitrine.nom,
          ville: livret.property?.city || vitrine.ville,
          type: livret.property?.type || vitrine.type,
          resume: livret.property?.welcomeMessage || vitrine.resume,
          image: estConfort ? photo || vitrine.image : undefined,
          accueil: estConfort ? undefined : accueilEssentiel(livret),
        };
      } catch (error) {
        console.error(`[chargerVitrines] Erreur pour ${vitrine.slug}:`, error);
        return vitrine;
      }
    })
  );

  return vitrines;
}

