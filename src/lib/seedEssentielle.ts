import { Accommodation } from "@/lib/types/accommodation";
import { createEmptyAccommodation } from "@/lib/livret";

/**
 * Livret Essentiel de référence.
 *
 * Il remplit TOUS les champs que la formule Essentielle permet de modifier,
 * et aucun autre. Il sert à deux choses :
 *
 *  - de témoin : si un champ manque à l'écran, c'est que le gabarit ne le
 *    rend pas ; s'il apparaît sans être ici, c'est qu'il n'est pas éditable ;
 *  - de page de démonstration, servie sur `/test-essentielle`.
 *
 * Les champs volontairement ABSENTS relèvent de la formule Confort : mot
 * d'accueil, photos, équipements, bonnes adresses, transports, questions
 * fréquentes, livre d'or, langues.
 */
export const seedEssentielle: Accommodation = {
  ...createEmptyAccommodation("test-essentielle"),

  id: "test-essentielle",
  offerType: "essential",
  template: "essential",
  isActive: true,

  /* ── Logement ─────────────────────────────────────────────────────── */
  property: {
    name: "Le Clos des Oliviers",
    type: "Maison de village",
    address: "14 rue des Remparts, 84160 Lourmarin",
    city: "Lourmarin",
    welcomeMessage: "",
    gallery: [],
    timezone: "Europe/Paris",
  },

  /* ── Contacts ─────────────────────────────────────────────────────── */
  owner: {
    name: "Camille Ferrand",
    email: "camille@closdesoliviers.fr",
    phone: "06 24 71 08 33",
  },
  contacts: [
    { label: "Gardien", name: "Marc Aubry", phone: "06 11 45 22 90", type: "other" },
    { label: "Ménage", name: "Sonia", phone: "06 78 90 12 34", type: "other" },
    { label: "SAMU", name: "SAMU", phone: "15", type: "emergency" },
    { label: "Pompiers", name: "Pompiers", phone: "18", type: "emergency" },
    { label: "Police", name: "Police", phone: "17", type: "emergency" },
    { label: "Urgences Europe", name: "Urgences Europe", phone: "112", type: "emergency" },
  ],

  /* ── Codes & Wi-Fi ────────────────────────────────────────────────── */
  wifi: {
    ssid: "ClosDesOliviers",
    password: "Lourmarin2026",
  },
  codes: [
    { label: "Portail de la rue", value: "14A72" },
    { label: "Boîte à clés", value: "3081" },
  ],

  /* ── Arrivée et départ ────────────────────────────────────────────── */
  practicalInfo: {
    checkin: "16h00",
    checkout: "10h30",
    arrivalNotes:
      "La boîte à clés est fixée à gauche du portail, sous la boîte aux lettres.\nEntrez le code, récupérez le trousseau, et refermez bien le clapet.",
    departureNotes:
      "Laissez les clés dans la boîte, code inchangé. Un message me suffit pour me prévenir de votre départ.",
    parking: "Place réservée n°3 dans la cour, entrée par la rue des Remparts",
    breakfast: "Panier du boulanger sur demande, à commander la veille avant 18h",
    departureInstructions: [
      { text: "Sortir les poubelles (containers au bout de la rue)", required: true },
      { text: "Lancer le lave-vaisselle", required: false },
      { text: "Fermer les volets du rez-de-chaussée", required: true },
      { text: "Remettre les clés dans la boîte", required: true },
    ],
  },

  /* ── Règlement ────────────────────────────────────────────────────── */
  rules: [
    "Logement non-fumeur à l'intérieur",
    "Pas de fête ni d'événement",
    "Calme entre 22h et 8h — les murs sont anciens",
    "Animaux acceptés sur demande préalable",
  ],

  /* ── Apparence : une des quatre couleurs proposées ────────────────── */
  comfortOptions: {
    faq: [],
    upsells: [],
    theme: { primaryColor: "#5A7A4E", fontFamily: "classic" },
    enabledLanguages: ["fr"],
  },

  createdAt: Date.now(),
  updatedAt: Date.now(),
};
