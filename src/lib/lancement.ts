/**
 * Date de lancement officiel de Guidz : 7 septembre 2026 à 00h00 (heure de Paris).
 *
 * Tout ce qui a été créé avant cette date correspond aux tests de conception et développement.
 * L'administration ne montre que les éléments réels créés à partir du lancement,
 * tout en conservant les 6 livrets de démonstration officiels du catalogue.
 */
export const DATE_LANCEMENT = new Date("2026-09-07T00:00:00+02:00").getTime();

export function estLivretDemo(slugOuId?: string | null): boolean {
  if (!slugOuId) return false;
  const s = slugOuId.toLowerCase();
  return s.startsWith("demo") || s.includes("demo-") || s.includes("demo_");
}
