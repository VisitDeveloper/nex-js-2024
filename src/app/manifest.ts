import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BrainWave Academy",
    short_name: "BrainWave",
    description: "BrainWave Academy",
    start_url: "/",
    display: "standalone",
    background_color: "#19C1B6",
    theme_color: "#19C1B6",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
