# Guidz - Spécifications du parrainage v1.1

## 1. Principes

- Firestore est la source de vérité des relations de parrainage et des récompenses.
- Stripe facture et applique les ajustements calculés par Guidz.
- Un compte filleul ne peut bénéficier du parrainage que sur sa première commande éligible.
- Le parrain est verrouillé lors de la création du Checkout. Une correction ultérieure est une opération administrateur auditée.
- Les avantages de parrainage ne se cumulent pas avec un code promotionnel public.

## 2. Lien de parrainage

- Le programme devient accessible au parrain uniquement après la confirmation de sa première commande payée.
- Avant ce paiement, la carte Parrainage reste visible mais aucun code ni lien n'est généré.
- Chaque propriétaire possède un code aléatoire unique de huit caractères.
- Le lien public est `/p/{code}`.
- Un code appartenant à un compte sans commande payée est refusé, y compris s'il avait été généré avant l'application de cette règle.
- Le serveur vérifie le code puis dépose un cookie signé, `HttpOnly`, `SameSite=Lax`, `Secure` en production, valable 30 jours.
- Un code falsifié, inconnu ou appartenant au filleul lui-même ne produit aucun avantage.

## 3. Avantage du filleul

### Essentielle

- Remise immédiate et unique de 5 € sur la première commande.
- Stripe reçoit un coupon interne à montant fixe ; aucun code n'est saisi par le client.

### Confort mensuel

- Six remises successives égales au prix mensuel d'un seul hébergement Confort.
- Une commande comportant plusieurs hébergements ne multiplie pas l'avantage.
- À partir de la septième échéance, l'unité concernée est réellement payante.
- Stripe reçoit dès le Checkout un coupon interne à montant fixe, limité au produit d'abonnement et répété pendant six mois. La remise est donc visible avant que le client paie.

### Confort annuel

- Remise unique égale à `prix annuel unitaire × 6 / 12`, arrondie une seule fois.
- Avec un prix de 19 €, la remise est de 9,50 €.
- Cette variante fournit la même valeur économique que six mois, mais le solde annuel est encaissé dès la commande.
- Stripe reçoit dès le Checkout un coupon interne unique de ce montant, limité au produit annuel.

Dans un panier mixte, la formule Confort est retenue comme avantage le plus favorable. Les autres promotions Stripe sont alors désactivées.

## 4. Crédit d'acquisition du parrain

- Les quatre premiers filleuls payés génèrent chacun 5 €, soit 20 € maximum sur la durée du programme.
- Essentielle et Confort déclenchent ce crédit dès le paiement de la commande ou de la plaque.
- Le crédit reste `PENDING` pendant sept jours, puis devient utilisable.
- Un parrain Essentielle conserve son crédit pour financer son passage à Confort.
- Un parrain Confort utilise automatiquement son crédit restant sur ses prochaines factures.
- Le crédit peut être consommé partiellement et son reliquat est conservé.

## 5. Droits Confort annuels du parrain

- Un filleul Confort actif donne un droit d'un mois par cycle de douze mois du parrain.
- Un filleul mensuel devient actif après les six échéances offertes, lors de la première facture récurrente réellement payée.
- Pour l'annuel avec remise économique immédiate, le filleul devient actif lorsque la facture annuelle partiellement payante est payée.
- Une résiliation ne reprend jamais un droit déjà accordé ; le filleul ne compte plus au cycle suivant.
- Un filleul actif ajouté en cours de cycle génère un droit pour le cycle en cours.
- Les droits non consommés ne sont pas reportés : ils sont recalculés au cycle suivant.
- Le plafond utile est `12 × nombre d'hébergements Confort facturés`. Le nombre total de filleuls n'est pas limité.

### Facturation mensuelle

À chaque facture :

```text
droits consommés = min(droits disponibles, quantité Confort facturée)
remise = droits consommés × prix mensuel unitaire
```

### Facturation annuelle

```text
droits utilisables = min(filleuls actifs, 12 × quantité Confort facturée)
remise = arrondi(prix annuel unitaire × droits utilisables / 12)
```

L'arrondi est effectué une fois sur le montant total de chaque catégorie d'avantage.

## 6. Ordre d'application

1. Avantage de bienvenue du filleul, si la facture le concerne.
2. Droits Confort annuels du parrain.
3. Crédit d'acquisition de 5 € restant.

Une facture à 0 € est considérée comme payée lorsque Stripe la marque `paid` et que l'abonnement reste actif. Elle ne déclenche pas de récompense en cascade.

## 7. Remboursements, échecs et litiges

- Un échec de paiement conserve la réservation sur la même facture.
- Une facture supprimée, annulée ou irrécouvrable libère ses réservations.
- Un remboursement complet ou un litige annule une récompense encore `PENDING` ou disponible.
- Une récompense déjà consommée n'est jamais réécrite : une écriture compensatrice négative est ajoutée au ledger.
- L'historique reste immuable et rapprochable avec Stripe.

## 8. Idempotence et concurrence

- Relation : document `referrals/{referredUid}`.
- Crédit : `welcome_{referredUid}`.
- Mois filleul : `child_{referredUid}_{1..6}`.
- Droit annuel : `comfort_{sponsorUid}_{cycleKey}_{referredUid}`.
- Ajustement : `referral_invoice_adjustments/{stripeInvoiceId}`.
- Consommation d'un coupon filleul : `referral_coupon_consumptions/{stripeInvoiceId}`.
- Quatre documents de slot atomiques garantissent le plafond des quatre crédits.
- Les appels Stripe utilisent une clé d'idempotence déterministe par facture.

## 9. Webhooks requis

- `checkout.session.completed`
- `invoice.created`
- `invoice.paid`
- `invoice.payment_failed`
- `invoice.voided`
- `invoice.deleted`
- `invoice.marked_uncollectible`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `charge.refunded`
- `charge.dispute.created`

La signature Stripe est vérifiée sur le corps brut. Pour `invoice.created`, l'ajustement est créé avant la réponse 2xx afin que la facture ne soit pas finalisée sans la remise.

## 10. Critères d'acceptation

- Un même fait générateur ne crée jamais deux récompenses.
- Des paiements simultanés ne dépassent jamais quatre crédits de bienvenue.
- Six mois filleul ne réduisent que l'équivalent d'un hébergement.
- Le calcul annuel de 20 droits à 19 € produit une remise totale de 31,67 €.
- Les prix sont lus sur les lignes Stripe et ne sont pas figés dans le calcul serveur.
- Un remboursement produit une annulation ou une compensation traçable.
- Une facture à 0 € consomme ses réservations une seule fois.
- Le tableau de bord expose le lien, les filleuls actifs, le crédit disponible et les droits du cycle.
