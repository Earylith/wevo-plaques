import "server-only";

import { adminDb } from "@/lib/firebase/admin";
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
 * On lit donc le livret. Ce qui relève de la mise en page — couleur, icône,
 * repères — reste curaté dans `livretsDemo.ts` ; ce qui décrit le logement
 * vient de la base, où l'administration le modifie.
 *
 * L'ESSENTIELLE reste sans photo : sa page n'en affiche aucune, et en poser
 * une promettrait ce que la formule ne livre pas. Elle reçoit à la place son
 * mot d'accueil, pour que la vignette dise quelque chose du livret.
 */

/**
 * Le texte d'accueil d'un livret Essentiel.
 *
 * Son gabarit compose une phrase standard quand l'hôte n'en a pas écrit :
 * on la reproduit à l'identique, sans quoi la vignette annoncerait autre
 * chose que la page.
 */
function accueilEssentiel(livret: Accommodation): string {
  const ecrit = livret.property?.welcomeMessage?.trim();
  if (ecrit) return ecrit;
  return `Bienvenue à ${livret.property?.name || "votre logement"} — vous trouverez ici toutes les informations utiles pour votre séjour.`;
}

export async function chargerVitrines(): Promise<VitrineGarnie[]> {
  /*
   * Une seule requête pour tous les livrets : six lectures séparées
   * ralentiraient la page d'accueil sans rien apporter.
   */
  const slugs = LIVRETS_DEMO.map((l) => l.slug);

  let livrets = new Map<string, Accommodation>();
  try {
    const snap = await adminDb
      .collection("accommodations")
      .where("slug", "in", slugs.slice(0, 30))
      .get();
    livrets = new Map(
      snap.docs.map((d) => [(d.data() as Accommodation).slug, d.data() as Accommodation])
    );
  } catch (error) {
    /*
     * La base injoignable ne doit pas vider la page d'accueil : on retombe sur
     * les valeurs curatées, qui restent justes même si elles sont figées.
     */
    console.error("[chargerVitrines]", error);
  }

  return LIVRETS_DEMO.map((vitrine) => {
    const livret = livrets.get(vitrine.slug);
    if (!livret) return vitrine;

    const estConfort = vitrine.formule === "Confort";
    const photo = livret.property?.mainImageUrl || livret.property?.gallery?.[0];

    return {
      ...vitrine,
      // Le nom vient du livret : le renommer dans l'admin doit suffire.
      nom: livret.property?.name || vitrine.nom,
      image: estConfort ? photo || vitrine.image : undefined,
      accueil: estConfort ? undefined : accueilEssentiel(livret),
    };
  });
}
