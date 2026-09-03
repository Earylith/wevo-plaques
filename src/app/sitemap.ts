import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/blog";
import { LIVRETS_DEMO } from "@/lib/livretsDemo";
import { urlAbsolue } from "@/lib/site";

/**
 * Le plan du site.
 *
 * Il ne liste que les pages publiques et stables. Sont volontairement
 * absents : l'administration, l'espace propriétaire, les tunnels de
 * commande, la démonstration de l'éditeur — qui se déclare elle-même non
 * indexable — et les livrets d'hébergements réels, qui appartiennent à
 * leurs hôtes et n'ont rien à faire dans un moteur de recherche.
 *
 * Les articles sont lus depuis le sommaire du blog : en ajouter un le fait
 * apparaître ici sans qu'on ait à y penser, ce qui est exactement le genre
 * d'oubli qui coûte des semaines d'indexation.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const maintenant = new Date();

  const pages: MetadataRoute.Sitemap = [
    {
      url: urlAbsolue("/"),
      lastModified: maintenant,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: urlAbsolue("/blog"),
      lastModified: maintenant,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: urlAbsolue("/livrets-demo"),
      lastModified: maintenant,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: urlAbsolue("/commencer"),
      lastModified: maintenant,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: urlAbsolue("/devis"),
      lastModified: maintenant,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: urlAbsolue("/confidentialite"),
      lastModified: maintenant,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const articles: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: urlAbsolue(`/blog/${article.slug}`),
    lastModified: new Date(`${article.dateMaj ?? article.datePublication}T12:00:00Z`),
    changeFrequency: "monthly",
    priority: article.vedette ? 0.85 : 0.7,
  }));

  const demonstrations: MetadataRoute.Sitemap = LIVRETS_DEMO.map((livret) => ({
    url: urlAbsolue(livret.href ?? `/${livret.slug}`),
    lastModified: maintenant,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...pages, ...articles, ...demonstrations];
}
