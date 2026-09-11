import "server-only";

import type { Accommodation } from "@/lib/types/accommodation";

/** Retire les champs internes avant toute sérialisation vers un composant client. */
export function publicAccommodation(data: Accommodation): Accommodation {
  const result: Accommodation = {
    ...data,
    owner: {
      name: data.owner?.name || "",
      phone: data.owner?.phone || "",
      email: data.owner?.reportEmail || "",
      reportEmail: data.owner?.reportEmail,
      slug: data.owner?.slug,
    },
  };

  delete result.ownerUid;
  delete result.mustChangePassword;
  delete result.stripeCustomerId;
  delete result.stripeSubscriptionId;
  delete result.abonnementRythme;
  delete result.paidAt;
  delete result.slugLocked;
  delete result.editionUntil;
  delete result.derniereVisiteEditeur;
  delete result.cancelAtPeriodEnd;
  delete result.translationJob;
  delete result.cleaningLogs;
  delete result.inventories;

  return result;
}
