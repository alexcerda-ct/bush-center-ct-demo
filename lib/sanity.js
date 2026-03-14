import { createClient } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2023-03-14", // use current date
  useCdn: true, // `false` if you want freshest data
});

export const urlFor = (source) => {
  const imageUrlBuilder = require("@sanity/image-url");
  const builder = imageUrlBuilder(client);
  return builder.image(source);
};