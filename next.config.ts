import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Les photos de couverture transitent par une Server Action ; la limite
    // par défaut (1 Mo) rejetterait les photos haute résolution d'ordinateur (Mac/PC) ou téléphone.
    serverActions: { bodySizeLimit: "10mb" },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },
};

export default nextConfig;
