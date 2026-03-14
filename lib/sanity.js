import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: "j4tfj2ui",           
  dataset: "production",           
  useCdn: false,                   
  apiVersion: "2026-03-13",
  token: "skehjhr4hC89jRXb5o19Keel8wzNbkoAzkny1Fg8ukAPsPKGk2X5AOJ5gErMelxrZ4CmsIa8fQgtdrFZ05chLBF5z6nQe7ayXUzcJIQDafXNrsrwPgUjKSuc6DZ7eyKoUILpykexpjR58g700G5TQy2kbPGVJHtNBhJ8ic9rcxuLoIS15SJq"
});

const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);