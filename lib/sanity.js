import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

// ─── Sanity client ───────────────────────────────────────────────────────────
export const client = createClient({
  projectId: "j4tfj2ui",       // your Sanity project ID
  dataset: "production",       // your dataset
  apiVersion: "2023-01-01",    // fixed API version
  useCdn: true                 // use CDN for fast, cached responses
});

// ─── Image builder ───────────────────────────────────────────────────────────
const builder = imageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);