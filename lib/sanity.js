import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  useCdn: false,
  apiVersion: "2026-03-13",
  token: process.env.SANITY_API_TOKEN,
});

export const urlFor = (source) => createImageUrlBuilder(client).image(source);