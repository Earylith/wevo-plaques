import type { MetadataRoute } from "next";
import { SITE_URL, urlAbsolue } from "@/lib/site";

/**
 * Les consignes d'exploration.
 *
 * On interdit ce qui ne doit jamais se retrouver dans un index : la console
 * d'administration, les points d'entrée applicatifs, l'espace propriétaire,
 * les tunnels de commande et les adresses courtes de redirection, qui
 * dupliqueraient les pages qu'elles désignent.
 *
 * Les livrets d'hébergements (`/h/...`) ne sont pas listés ici : les
 * livrets de démonstration y vivent et servent la vitrine. Si vous
 * souhaitez qu'aucun livret réel ne soit explorable — ils contiennent des
 * codes d'accès et des mots de passe Wi-Fi —, c'est cette ligne qu'il faut
 * ajouter, et il faudra alors sortir les démonstrations du plan du site.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/proprietaire",
        "/commande",
        "/demo-editeur",
        "/g/",
        "/c/",
      ],
    },
    sitemap: urlAbsolue("/sitemap.xml"),
    // Sans barre finale : la directive attend un hôte, pas une adresse.
    host: SITE_URL,
  };
}
